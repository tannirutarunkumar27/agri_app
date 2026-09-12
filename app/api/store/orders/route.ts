import { NextResponse } from 'next/server'
import { query, runTransaction } from '@/lib/db'
import { normalizeAndValidatePhone, validatePinCode, validateQuantity, sanitizeText } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      userName,
      userPhone,
      address,
      deliverySpeed = 'standard',
      paymentMethod = 'cod',
      items,
      couponCode,
      couponDiscount = 0,
      coinsUsed = 0
    } = body

    if (!userName || !userPhone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields or empty cart.' },
        { status: 400 }
      )
    }

    // Input Validation
    const cleanUserName = sanitizeText(userName)
    if (cleanUserName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid recipient name.' },
        { status: 400 }
      )
    }

    const phoneValidation = normalizeAndValidatePhone(userPhone)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error || 'Invalid phone number format.' },
        { status: 400 }
      )
    }

    if (address.pincode) {
      const pinValidation = validatePinCode(address.pincode)
      if (!pinValidation.valid) {
        return NextResponse.json(
          { success: false, error: pinValidation.error || 'Invalid PIN code.' },
          { status: 400 }
        )
      }
    }

    // Validate item quantities and bounds
    for (const item of items) {
      const qtyValidation = validateQuantity(item.quantity)
      if (!qtyValidation.valid) {
        return NextResponse.json(
          { success: false, error: qtyValidation.error || 'Invalid item quantity.' },
          { status: 400 }
        )
      }
    }

    const orderId = `FARM-${Math.floor(100000 + Math.random() * 900000)}`

    // Execute atomic ACID transaction with PostgreSQL row-level locking (FOR UPDATE)
    const orderResult = await runTransaction(async (tx) => {
      let computedSubtotal = 0
      const processedItems: Array<{
        productId: string
        productName: string
        quantity: number
        unitPrice: number
        totalPrice: number
      }> = []

      // 1. Consistency, Atomicity & Concurrency: Lock rows with FOR UPDATE to prevent race conditions
      for (const item of items) {
        const productRow = await tx.queryOne<any>(
          'SELECT id, name, price, stock_count, in_stock FROM products WHERE id = $1 FOR UPDATE',
          [item.productId]
        )

        if (!productRow) {
          throw new Error(`Product not found in database: ${item.productId}`)
        }

        const currentStock = Number(productRow.stock_count)
        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${productRow.name}". Available: ${currentStock}, Requested: ${item.quantity}`
          )
        }

        const unitPrice = Number(productRow.price)
        const itemTotal = unitPrice * item.quantity
        computedSubtotal += itemTotal

        // 2. Deduct inventory inside transaction
        const newStock = currentStock - item.quantity
        const newInStock = newStock > 0
        await tx.execute(
          'UPDATE products SET stock_count = $1, in_stock = $2 WHERE id = $3',
          [newStock, newInStock, productRow.id]
        )

        processedItems.push({
          productId: productRow.id,
          productName: productRow.name,
          quantity: item.quantity,
          unitPrice,
          totalPrice: itemTotal
        })
      }

      const deliveryFee = deliverySpeed === 'priority' ? 99 : computedSubtotal >= 499 ? 0 : 49
      const gst = Math.round(computedSubtotal * 0.05) // 5% Fertilizer GST
      const coinsDiscount = Math.min(coinsUsed, computedSubtotal)
      const totalDiscount = couponDiscount + coinsDiscount
      const finalTotal = Math.max(0, computedSubtotal - totalDiscount + deliveryFee + gst)

      // Reward Kisan Coins: 1 coin per ₹20 spent (Flipkart SuperCoins pattern)
      const coinsEarned = Math.floor(finalTotal / 20)

      // 3. Insert into orders table
      await tx.execute(
        `INSERT INTO orders (
          id, user_name, user_phone, address_json, delivery_speed, payment_method,
          subtotal, delivery_fee, discount, gst, coins_used, coins_earned, final_total, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'CONFIRMED')`,
        [
          orderId,
          cleanUserName,
          phoneValidation.normalized,
          JSON.stringify(address),
          deliverySpeed,
          paymentMethod,
          computedSubtotal,
          deliveryFee,
          totalDiscount,
          gst,
          coinsUsed,
          coinsEarned,
          finalTotal
        ]
      )

      // 4. Insert into order_items table (foreign key to orders)
      for (const pItem of processedItems) {
        await tx.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId,
            pItem.productId,
            pItem.productName,
            pItem.quantity,
            pItem.unitPrice,
            pItem.totalPrice
          ]
        )
      }

      // 5. Insert initial status log entry
      await tx.execute(
        `INSERT INTO order_status_log (order_id, status, notes)
         VALUES ($1, 'CONFIRMED', 'Order received and verified under PostgreSQL ACID transaction.')`,
        [orderId]
      )

      // 6. Record coupon usage if coupon applied
      if (couponCode) {
        await tx.execute(
          'UPDATE coupons SET usage_count = usage_count + 1 WHERE code = $1',
          [couponCode]
        )
      }

      // 7. Deduct coins from user if exists
      const user = await tx.queryOne<any>(
        'SELECT id, kisan_coins FROM users WHERE phone = $1',
        [phoneValidation.normalized]
      )
      if (user) {
        const updatedCoins = Math.max(0, Number(user.kisan_coins) - coinsUsed + coinsEarned)
        await tx.execute('UPDATE users SET kisan_coins = $1 WHERE id = $2', [updatedCoins, user.id])

        // Add order confirmation notification
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            `notif-ord-${orderId}`,
            user.id,
            `Order Confirmed: ${orderId}`,
            `Your order of ₹${finalTotal.toLocaleString('en-IN')} has been booked. Earned ${coinsEarned} Kisan Coins!`,
            'order',
            `/store/orders?id=${orderId}`
          ]
        )
      }

      return {
        orderId,
        subtotal: computedSubtotal,
        deliveryFee,
        discount: totalDiscount,
        gst,
        coinsEarned,
        finalTotal,
        itemsCount: processedItems.length,
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Order created with PostgreSQL ACID transaction guarantee and inventory updated.',
      order: orderResult
    })
  } catch (error: any) {
    console.error('ACID Order Placement Error (Rolled back):', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process order' },
      { status: 400 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const id = searchParams.get('id')

    let sql = 'SELECT * FROM orders'
    const params: any[] = []

    if (id) {
      sql += ' WHERE id = $1'
      params.push(id)
    } else if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10)
      sql += ' WHERE user_phone LIKE $1'
      params.push(`%${cleanPhone}%`)
    }

    sql += ' ORDER BY created_at DESC LIMIT 50'

    const orders = await query<any>(sql, params)

    // Attach items and status history to each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await query<any>('SELECT * FROM order_items WHERE order_id = $1', [order.id])
        const statusHistory = await query<any>(
          'SELECT * FROM order_status_log WHERE order_id = $1 ORDER BY updated_at ASC',
          [order.id]
        )

        let parsedAddress = {}
        try {
          parsedAddress =
            typeof order.address_json === 'string'
              ? JSON.parse(order.address_json)
              : order.address_json || {}
        } catch {
          parsedAddress = {}
        }

        return {
          ...order,
          subtotal: Number(order.subtotal),
          delivery_fee: Number(order.delivery_fee),
          discount: Number(order.discount),
          gst: Number(order.gst),
          final_total: Number(order.final_total),
          address: parsedAddress,
          items: items.map((it) => ({
            ...it,
            unit_price: Number(it.unit_price),
            total_price: Number(it.total_price)
          })),
          statusHistory
        }
      })
    )

    return NextResponse.json({ success: true, count: populatedOrders.length, orders: populatedOrders })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
