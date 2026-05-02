import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface GarmentItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    customerName: string;
    phone: string;
    garments: { name: string; quantity: number; price: number; total: number }[];
    totalBill: number;
    status: 'RECEIVED' | 'PROCESSING' | 'READY' | 'DELIVERED';
    createdAt: string;
}

let orders: Order[] = [];

// 1. Create Order
app.post('/orders', (req: Request, res: Response) => {
    const { customerName, phone, garments } = req.body;

    if (!customerName || !phone || !garments || !Array.isArray(garments)) {
        return res.status(400).json({ error: "Customer name, phone number, and a garments array are required" });
    }

    let totalBillAmount = 0;
    const items = garments.map((item: GarmentItem) => {
        const itemTotal = item.quantity * item.price;
        totalBillAmount += itemTotal;
        return {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: itemTotal
        };
    });

    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        customerName,
        phone,
        garments: items,
        totalBill: totalBillAmount,
        status: 'RECEIVED',
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
});

// 2. Order Status Management
app.patch('/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status provided" });
    }

    const order = orders.find(o => o.id === id);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    res.json(order);
});

// 3. View Orders
app.get('/orders', (req: Request, res: Response) => {
    const { status, search } = req.query;
    let filteredOrders = orders;

    if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === (status as string).toUpperCase());
    }

    if (search) {
        const query = (search as string).toLowerCase();
        filteredOrders = filteredOrders.filter(o =>
            o.customerName.toLowerCase().includes(query) ||
            o.phone.includes(query)
        );
    }

    res.json(filteredOrders);
});

// 4. Basic Dashboard
app.get('/dashboard', (req: Request, res: Response) => {
    const totalOrders = orders.length;
    let totalRevenue = 0;
    
    // Explicit type definition for our status count object
    const ordersPerStatus: { [key: string]: number } = {
        RECEIVED: 0,
        PROCESSING: 0,
        READY: 0,
        DELIVERED: 0
    };

    orders.forEach(o => {
        totalRevenue += o.totalBill;
        if (ordersPerStatus[o.status] !== undefined) {
            ordersPerStatus[o.status]++;
        }
    });

    res.json({
        totalOrders,
        totalRevenue,
        ordersPerStatus
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});