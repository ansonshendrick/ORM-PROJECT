const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // Find all tags and include associated Product data
    const tags = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Find a single tag by its `id` and include associated Product data
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Create a new tag
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update a tag's name by its `id` value
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await tag.update(req.body);
    res.json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete a tag by its `id` value
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await tag.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
