const { formidable } = require('formidable');
const cloudinary = require('cloudinary').v2;
const designModel = require('../models/designModel');
const userImageModel = require('../models/userImageModel');
const designImageModel = require('../models/designImageModel');
const backgroundImageModel = require('../models/backgroundImageModel');
const templateModel = require('../models/templateModel');
const { mongo: { ObjectId } } = require('mongoose');

class DesignController {

  // Configure Cloudinary
  configureCloudinary = () => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true // ensures HTTPS URLs
    });
  };

  // Helper to parse formidable forms as a promise
  parseForm = (req) => {
    const form = formidable({});
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });
  };

  create_user_design = async (req, res) => {
    const { _id } = req.userInfo;

    try {
      this.configureCloudinary();
      const [fields, files] = await this.parseForm(req);
      const { image } = files;

      if (!image || !image[0]?.filepath) {
        return res.status(400).json({ message: 'No image provided' });
      }

      const result = await cloudinary.uploader.upload(image[0].filepath);
      const design = await designModel.create({
        user_id: _id,
        components: [JSON.parse(fields.design[0])],
        image_url: result.secure_url
      });

      return res.status(200).json({ design });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  update_user_design = async (req, res) => {
    const { design_id } = req.params;

    try {
      this.configureCloudinary();
      const [fields, files] = await this.parseForm(req);
      const { image } = files;
      const components = JSON.parse(fields.design[0]).design;

      const old_design = await designModel.findById(design_id);
      if (!old_design) return res.status(404).json({ message: 'Design not found' });

      // Delete old image from Cloudinary if exists
      if (old_design.image_url) {
        const imageName = old_design.image_url
          .split('/')
          .pop()
          .split('.')[0];
        await cloudinary.uploader.destroy(imageName);
      }

      let image_url = old_design.image_url;

      if (image && image[0]?.filepath) {
        const result = await cloudinary.uploader.upload(image[0].filepath);
        image_url = result.secure_url;
      }

      await designModel.findByIdAndUpdate(design_id, { image_url, components });

      return res.status(200).json({ message: "Design updated successfully" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  get_user_design = async (req, res) => {
    const { design_id } = req.params;

    try {
      const design = await designModel.findById(design_id);
      if (!design) return res.status(404).json({ message: 'Design not found' });
      return res.status(200).json({ design: design.components });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  add_user_image = async (req, res) => {
    const { _id } = req.userInfo;

    try {
      this.configureCloudinary();
      const [_, files] = await this.parseForm(req);
      const { image } = files;

      if (!image || !image[0]?.filepath) {
        return res.status(400).json({ message: 'No image provided' });
      }

      const result = await cloudinary.uploader.upload(image[0].filepath);
      const userImage = await userImageModel.create({
        user_id: _id,
        image_url: result.secure_url
      });

      return res.status(201).json({ userImage });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  get_user_image = async (req, res) => {
    const { _id } = req.userInfo;

    try {
      const images = await userImageModel.find({ user_id: new ObjectId(_id) });
      return res.status(200).json({ images });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  get_initial_image = async (req, res) => {
    try {
      const images = await designImageModel.find({});
      return res.status(200).json({ images });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  get_background_image = async (req, res) => {
    try {
      const images = await backgroundImageModel.find({});
      return res.status(200).json({ images });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  get_user_designs = async (req, res) => {
    const { _id } = req.userInfo;

    try {
      const designs = await designModel.find({ user_id: new ObjectId(_id) }).sort({ createdAt: -1 });
      return res.status(200).json({ designs });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  delete_user_image = async (req, res) => {
    const { design_id } = req.params;

    try {
      await designModel.findByIdAndDelete(design_id);
      return res.status(200).json({ message: 'Design deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  get_templates = async (req, res) => {
    try {
      const templates = await templateModel.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ templates });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  add_user_template = async (req, res) => {
    const { template_id } = req.params;
    const { _id } = req.userInfo;

    try {
      const template = await templateModel.findById(template_id);
      if (!template) return res.status(404).json({ message: 'Template not found' });

      const design = await designModel.create({
        user_id: _id,
        components: template.components,
        image_url: template.image_url
      });

      return res.status(200).json({ design });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

}

module.exports = new DesignController();
