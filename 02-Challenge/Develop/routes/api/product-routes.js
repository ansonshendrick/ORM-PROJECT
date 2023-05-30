const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // Find all products and include associated Category and Tag data
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    // Find a single product by its `id` and include associated Category and Tag data
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    // Create a new product
    const product = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      // If there are product tags, create pairings to bulk create in the ProductTag model
      const productTagIdArr = req.body.tagIds.map((tagId) => ({
        product_id: product.id,
        tag_id: tagId,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      // Find all associated tags from ProductTag
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      // Get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);

      // Create a filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));

      // Figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // Run both actions
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete one product by its `id` value
    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
