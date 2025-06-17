export const getCoupon = async (req, res) => {
	const user = req.user;
	const coupon = await Coupon.findOne({
		userId: user._id,
		isActive: true,
	});
	res.json(coupon || null);
};

export const validateCoupon = async (req, res) => {
	const user = req.user;
	const { code } = req.body;

	const coupon = await Coupon.findOne({
		code,
		userId: user._id,
		isActive: true,
	});

	if (!coupon) {
		return res.status(404).json({ message: 'Coupon not found or inactive' });
	}

	if (coupon.expirationDate < new Date()) {
		if (coupon.isActive) {
			coupon.isActive = false;
			await coupon.save();
		}
		return res.status(400).json({ message: 'Coupon has expired' });
	}

	res.json({
		message: 'Coupon is valid',
		code: coupon.code,
		discountPercentage: coupon.discountPercentage,
	});
};
