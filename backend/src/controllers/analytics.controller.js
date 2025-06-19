import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';

export const getAnalytics = async (req, res) => {
	const analyticsData = await getAnalyticsData();

	const startDate = new Date();
	const endDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

	const dailySalesData = await getDailySalesData(startDate, endDate);

	res.status(200).json({
		analyticsData,
		dailySalesData,
	});
};

const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$group: {
				_id: null,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: '$totalAmount' },
			},
		},
	]);

	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
	};
};

export const getDailySalesData = async (startDate, endDate) => {
	const dailySalesData = await Order.aggregate([
		{
			$match: {
				createdAt: {
					$gte: startDate,
					$lt: endDate,
				},
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				sales: { $sum: 1 },
				revenue: { $sum: '$totalAmount' },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	const dateArray = getDatesInRange(startDate, endDate);

	return dateArray.map(date => {
		const foundData = dailySalesData.find(data => data._id === date);
		return {
			date,
			sales: foundData ? foundData.sales : 0,
			revenue: foundData ? foundData.revenue : 0,
		};
	});
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split('T')[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}
