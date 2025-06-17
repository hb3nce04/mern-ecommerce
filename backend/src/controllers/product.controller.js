import cloudinary from '../lib/cloudinary.js';
import { redis } from '../lib/redis.js';
import { Product } from '../models/product.model.js';

export const getAllProducts = async (req, res) => {
	const products = await Product.find({});
	res.json({ products });
};

export const getFeaturedProducts = async (req, res) => {
	let featuredProducts = await redis.get('featured_products');

	if (featuredProducts) {
		return res.json({ products: JSON.parse(featuredProducts) });
	}

	featuredProducts = await Product.find({ isFeatured: true }).lean();

	if (!featuredProducts) {
		return res.status(404).json({ message: 'No featured products found' });
	}

	await redis.set('featured_products', JSON.stringify(featuredProducts));

	res.json({ featuredProducts });
};

export const createProduct = async (req, res) => {
	const { name, description, price, image, category } = req.body;

	let cloudinaryResponse = null;

	if (image) {
		cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: 'products' });
	}

	const product = await Product.create({
		name,
		description,
		price,
		image: cloudinaryResponse?.secure_url || '',
		category,
	});

	res.status(201).json({ product });
};

export const deleteProduct = async (req, res) => {
	const { id } = req.params;

	const product = await Product.findBy(id);

	if (!product) {
		return res.status(404).json({ message: 'Product not found' });
	}

	if (product.image) {
		const publicId = product.image.split('/').pop().split('.')[0];
		await cloudinary.uploader.destroy(`products/${publicId}`);
	}

	await Product.findByIdAndDelete(id);

	res.json({ message: 'Product deleted successfully' });
};

export const getRecommendedProducts = async (req, res) => {
	const recommendedProducts = await Product.aggregate([
		{
			$sample: { size: 3 },
		},
		{
			$project: {
				_id: 1,
				name: 1,
				description: 1,
				image: 1,
				price: 1,
			},
		},
	]);

	res.json({ recommendedProducts });
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;

	const products = await Product.find({ category });

	res.json({ products });
};

export const toggleFeaturedProduct = async (req, res) => {
	const { id } = req.params;

	const product = await Product.findById(id);
	if (!product) {
		return res.status(404).json({ message: 'Product not found' });
	}

	product.isFeatured = !product.isFeatured;

	const updatedProduct = await product.save();
	await updateFeaturedProductsCache();

	res.json({ product: updatedProduct });
};

async function updateFeaturedProductsCache() {
	try {
		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set('featured_products', JSON.stringify(featuredProducts));
	} catch (error) {
		console.error(error);
	}
}
