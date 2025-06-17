export const addToCart = async (req, res) => {
	const { productId } = req.body;
	const user = req.user;

	const existingItem = user.cartItems.find(item => item.productId === productId);
	if (existingItem) {
		existingItem.quantity += 1;
	} else {
		user.cartItems.push({ productId });
	}

	await user.save();
	res.json(cartItems);
};

export const removeAllFromCart = async (req, res) => {
	const { productId } = req.body;
	const user = req.user;
	if (!productId) {
		user.cartItems = [];
	} else {
		cartItems = user.cartItems.filter(item => item.id !== productId);
	}
	await user.save();
	res.json(cartItems);
};

export const updateQuantity = async (req, res) => {
	const { id: productId } = req.params;
	const { quantity } = req.body;
	const user = req.user;
	const existingItem = user.cartItems.find(item => item.id === productId);

	if (existingItem) {
		if (quantity === 0) {
			user.cartItems = user.cartItems.filter(item => item.id !== productId);
			await user.save();
			return res.json(user.cartItems);
		}

		existingItem.quantity = quantity;
		await user.save();
		return res.json(user.cartItems);
	}
};

export const getCartProducts = async (req, res) => {
	const user = req.user;
	const products = await Product.find({
		_id: { $in: req.user.cartItems },
	});

	const cartItems = products.map(product => {
		const item = user.cartItems.find(item => item.productId === product._id);
		return {
			...product.toJSON(),
			quantity: item.quantity,
		};
	});

	res.json(cartItems);
};
