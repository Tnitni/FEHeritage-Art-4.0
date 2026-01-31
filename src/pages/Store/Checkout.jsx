import React, { useState, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import PaymentMethods from "../../components/PaymentMethods";
import { Link } from "react-router-dom";

export default function Checkout() {
	const { cart, getTotalPrice, clearCart } = useCart();

	const [customer, setCustomer] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		note: "",
	});

	const subtotal = useMemo(() => getTotalPrice(), [getTotalPrice]);
	const shipping = 0;
	const total = subtotal + shipping;

	const isValid = () =>
		customer.name.trim() && customer.phone.trim() && customer.address.trim();

	// ─── LƠU VÀO paymentHistory ───
	const savePaymentHistory = (order) => {
		try {
			const now = new Date();
			const record = {
				id: order.id,
				customerName: order.customer.name,
				email: order.customer.email || "",
				phone: order.customer.phone || "",
				address: order.customer.address || "",
				note: order.customer.note || "",
				items: order.items.map((item) => ({
					title: item.title,
					selectedType: item.selectedType,
					quantity: item.quantity,
					price: item.price,
				})),
				totalAmount: order.amounts.total,
				paymentMethod: order.payment.method,
				bankName: order.payment.bankInfo?.bankName || order.payment.card?.type || "",
				date: now.toLocaleDateString("vi-VN"),
				time: now.toLocaleTimeString("vi-VN"),
				timestamp: now.toISOString(),
				status: order.payment.status === "success" ? "Thành công" : "Đang xử lý",
			};

			// Đọc array hiện tại, push thêm, lưu lại
			let history = [];
			const raw = localStorage.getItem("paymentHistory");
			if (raw) {
				history = JSON.parse(raw);
			}
			history.push(record);
			localStorage.setItem("paymentHistory", JSON.stringify(history));
		} catch (err) {
			console.error("Lỗi lưu paymentHistory:", err);
		}
	};

	// ─── XỬ LÝ THANH TOÁN ───
	const onPay = (method, details) => {
		const order = {
			id: `ORD-${Date.now()}`,
			createdAt: new Date().toISOString(),
			items: cart,
			amounts: { subtotal, shipping, total },
			customer,
			payment: {
				amount: details.amount,
				method: details.method,
				card: details.card,
				bankInfo: details.bankInfo,
				status: details.status,
			},
			source: "store-checkout",
		};

		try {
			// Giữ lastOrder cho ThankYou page
			localStorage.setItem("lastOrder", JSON.stringify(order));
		} catch (_) {}

		// ─── LƠU VÀO LỊCH SỬ PAYMENT ───
		savePaymentHistory(order);

		// Dọn giỏ hàng sau thanh toán
		clearCart();
		// PaymentMethods sẽ tự redirect /thank-you sau 3s
		console.log("Order created:", order);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="mx-auto max-w-6xl px-4 py-8">
				<h1 className="mb-6 text-2xl font-bold text-gray-800">Thanh toán</h1>

				{cart.length === 0 ? (
					<div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
						<p className="mb-4 text-gray-600">Giỏ hàng trống. Hãy thêm sản phẩm trước khi thanh toán.</p>
						<Link
							to="/mua-tranh-in"
							className="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 font-medium text-white shadow hover:from-orange-600 hover:to-amber-600"
						>
							Tiếp tục mua sắm
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Thông tin người nhận */}
						<div className="lg:col-span-2 space-y-6">
							<div className="rounded-xl border bg-white p-5 shadow-sm">
								<h2 className="mb-4 text-lg font-semibold text-gray-800">Thông tin người nhận</h2>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="md:col-span-2">
										<label className="mb-1 block text-sm font-medium text-gray-700">
											Họ và tên <span className="text-red-500">*</span>
										</label>
										<input
											className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
											value={customer.name}
											onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
											placeholder="Nguyễn Văn A"
										/>
									</div>
									<div>
										<label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại *</label>
										<input
											className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
											value={customer.phone}
											onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
											placeholder="09xx xxx xxx"
										/>
									</div>
									<div>
										<label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
										<input
											type="email"
											className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
											value={customer.email}
											onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
											placeholder="you@example.com"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="mb-1 block text-sm font-medium text-gray-700">Địa chỉ nhận hàng *</label>
										<input
											className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
											value={customer.address}
											onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
											placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú</label>
										<textarea
											className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
											rows={3}
											value={customer.note}
											onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
											placeholder="Ghi chú cho đơn hàng (nếu có)"
										/>
									</div>
								</div>
								{!isValid() && (
									<p className="mt-3 text-sm text-red-600">Vui lòng nhập Họ tên, Số điện thoại và Địa chỉ trước khi thanh toán.</p>
								)}
							</div>

							{/* Phương thức thanh toán */}
							<div className="rounded-xl border bg-white p-5 shadow-sm">
								<h2 className="mb-4 text-lg font-semibold text-gray-800">Phương thức thanh toán</h2>
								<PaymentMethods
									total={total}
									onPay={(method, details) => {
										if (!isValid()) {
											alert("Vui lòng điền đầy đủ thông tin nhận hàng.");
											return;
										}
										onPay(method, details);
									}}
								/>
							</div>
						</div>

						{/* Tóm tắt đơn hàng */}
						<div className="h-max rounded-xl border bg-white p-5 shadow-sm">
							<h2 className="mb-3 text-lg font-semibold text-gray-800">Đơn hàng của bạn</h2>
							<div className="space-y-3">
								{cart.map((item) => (
									<div key={`${item.id}-${item.selectedType}`} className="flex items-center gap-3">
										<img src={item.image} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
										<div className="flex-1">
											<div className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</div>
											<div className="text-xs text-gray-500">
												{item.selectedType} × {item.quantity}
											</div>
										</div>
										<div className="text-sm font-semibold text-gray-700">
											{(item.price * item.quantity).toLocaleString()}₫
										</div>
									</div>
								))}
							</div>

							<div className="my-3 border-t" />
							<div className="space-y-1 text-sm">
								<div className="flex items-center justify-between">
									<span>Tạm tính</span>
									<span className="font-medium">{subtotal.toLocaleString()}₫</span>
								</div>
								<div className="flex items-center justify-between text-gray-500">
									<span>Vận chuyển</span>
									<span>{shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString()}₫`}</span>
								</div>
								<div className="my-2 border-t" />
								<div className="flex items-center justify-between text-base">
									<span className="font-semibold">Tổng cộng</span>
									<span className="font-bold text-orange-600">{total.toLocaleString()}₫</span>
								</div>
							</div>

							<Link
								to="/cart"
								className="mt-4 block text-center text-sm font-medium text-orange-600 hover:underline"
							>
								← Quay lại giỏ hàng
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}