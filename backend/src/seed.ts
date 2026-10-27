import { connectDB } from "./config/db";
import { env } from "./config/env";
import { User } from "./models/User";
import { Category } from "./models/Category";
import { Product } from "./models/Product";
import { CEOMessage } from "./models/CEOMessage";
import { StoreSettings } from "./models/Coupon";
import bcrypt from "bcryptjs";

const IMGS = [
  "/569526436_18373168510150444_8034119568919736111_n.jpg",
  "/586867212_18379203601150444_3002517375187693764_n.jpg",
  "/572039913_18374106217150444_7965437272829275513_n.jpg",
  "/610789892_18383944330150444_7584768845937992713_n.jpg",
  "/580505482_18376628098150444_5202817661101760651_n.jpg",
  "/565298984_18074137015942276_2677569173539782527_n(1).jpg",
  "/564295548_18104128789618940_2669776670156205894_n(1).jpg",
  "/619205944_18385210300150444_2595574325418311907_n.jpg",
  "/587105986_18378496276150444_9082675863249113659_n.jpg",
  "/586922428_18082180835108941_555699749925538631_n(1).jpg",
  "/572135987_18374654647150444_4111438051662956265_n.jpg",
  "/504222860_18357316930150444_9188908467971046494_n.jpg",
];

async function seed() {
  await connectDB();
  const adminEmail = "admin@xaviourbeautystore.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: "Admin", email: adminEmail, password: await bcrypt.hash("Admin123!", 12), role: "admin" });
    console.log("Admin created:", adminEmail, "password Admin123!");
  }
  const cats = [
    "Professional Skin Treatment Machines",
    "Tattoo Removal Machines",
    "Moon LED Lighting Equipment",
    "Vacuum Therapy Machines",
    "Ultrasonic Skin Scalers",
    "Facial Skin Analysis Machines",
    "Salon Chairs and Furniture",
    "Salon Backwash Units",
    "Portable Sauna Baths",
    "Stone Massage Kits",
    "Spa Equipment",
    "Beauty Accessories",
  ];
  for (let i = 0; i < cats.length; i++) {
    const slug = cats[i].toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await Category.updateOne({ slug }, { name: cats[i], slug, order: i, isActive: true }, { upsert: true });
  }
  const categoryDocs = await Category.find();
  const bySlug = (s: string) => categoryDocs.find((c) => c.slug === s)!;

  if ((await Product.countDocuments()) < 12) {
    const products = [
      { name: "Professional Facial Skin Analysis Machine A8", slug: "professional-facial-skin-analysis-machine-a8", description: "Advanced facial skin analysis machine for professional use, with high-resolution imaging and AI-powered skin diagnostics.", category: bySlug("facial-skin-analysis-machines")._id, images: [IMGS[0]], price: 450000, originalPrice: 500000, stockQuantity: 10, featured: true, bestSeller: true, newArrival: true },
      { name: "Portable Sauna Bath Spa", slug: "portable-sauna-bath-spa", description: "Compact portable sauna bath for home, spa and wellness centres.", category: bySlug("portable-sauna-baths")._id, images: [IMGS[1]], price: 120000, stockQuantity: 5 },
      { name: "Ultrasonic Skin Scrubber Pro", slug: "ultrasonic-skin-scrubber-pro", description: "Professional ultrasonic skin scaler for deep cleansing and exfoliation.", category: bySlug("ultrasonic-skin-scalers")._id, images: [IMGS[2]], price: 45000, originalPrice: 55000, stockQuantity: 15, bestSeller: true },
      { name: "Vacuum Therapy Machine VT-200", slug: "vacuum-therapy-machine-vt-200", description: "Multi-function vacuum therapy machine for body contouring and skin tightening.", category: bySlug("vacuum-therapy-machines")._id, images: [IMGS[3]], price: 280000, stockQuantity: 4 },
      { name: "Tattoo Removal Laser Machine", slug: "tattoo-removal-laser-machine", description: "Q-switched laser tattoo removal machine for professional clinics.", category: bySlug("tattoo-removal-machines")._id, images: [IMGS[4]], price: 650000, originalPrice: 720000, stockQuantity: 3, featured: true },
      { name: "Moon LED Ring Light Kit", slug: "moon-led-ring-light-kit", description: "Professional moon LED lighting kit for salon photography and content creation.", category: bySlug("moon-led-lighting-equipment")._id, images: [IMGS[5]], price: 35000, stockQuantity: 20, newArrival: true },
      { name: "Professional Salon Chair", slug: "professional-salon-chair", description: "Ergonomic hydraulic salon chair with adjustable height.", category: bySlug("salon-chairs-and-furniture")._id, images: [IMGS[6]], price: 95000, stockQuantity: 8 },
      { name: "Salon Backwash Unit", slug: "salon-backwash-unit", description: "Premium ceramic basin backwash unit with reclining chair.", category: bySlug("salon-backwash-units")._id, images: [IMGS[7]], price: 180000, stockQuantity: 4 },
      { name: "Hot Stone Massage Kit", slug: "hot-stone-massage-kit", description: "Complete basalt stone massage kit with heater and oils.", category: bySlug("stone-massage-kits")._id, images: [IMGS[8]], price: 25000, stockQuantity: 12 },
      { name: "Spa Equipment Bundle", slug: "spa-equipment-bundle", description: "All-in-one spa equipment bundle for new spa setups.", category: bySlug("spa-equipment")._id, images: [IMGS[9]], price: 350000, originalPrice: 400000, stockQuantity: 2, featured: true },
      { name: "Beauty Accessories Kit", slug: "beauty-accessories-kit", description: "Essential beauty accessories kit for professionals.", category: bySlug("beauty-accessories")._id, images: [IMGS[10]], price: 15000, stockQuantity: 30, newArrival: true },
      { name: "Professional Skin Treatment Machine", slug: "professional-skin-treatment-machine", description: "Multi-function professional skin treatment machine for clinics.", category: bySlug("professional-skin-treatment-machines")._id, images: [IMGS[11]], price: 520000, stockQuantity: 3 },
    ];
    for (const p of products) {
      await Product.updateOne({ slug: p.slug }, { ...p, status: "published" }, { upsert: true });
    }
  }

  if ((await CEOMessage.countDocuments()) === 0) {
    await CEOMessage.create({
      title: "A Message from Our Founder",
      greeting: "Welcome to Xaviourbeautystore",
      message: "Welcome to Xaviourbeautystore, your trusted destination for professional beauty, skincare, spa, and salon equipment. We are dedicated to empowering beauty professionals, spa owners, and salon entrepreneurs with world-class equipment that delivers real results. Every machine in our collection is carefully selected for performance, durability, and value, ensuring that you and your clients receive the exceptional care you deserve. Whether you are launching a new venture or upgrading your existing setup, we are here to support your journey every step of the way. Thank you for trusting us to be part of your beauty story. Together, let us elevate the standard of beauty care.",
      ceoName: "Xaviour",
      designation: "Founder & CEO, Xaviourbeautystore",
      profileImage: "/xavioure.jpg",
      bannerImage: "/xaviour logo.jpg",
      status: "published",
      featuredInHero: true,
      publishedAt: new Date(),
    });
  } else {
    await CEOMessage.updateOne({ featuredInHero: true }, { profileImage: "/xavioure.jpg", bannerImage: "/xaviour logo.jpg" });
  }

  if ((await StoreSettings.countDocuments()) === 0) {
    await StoreSettings.create({ storeName: "Xaviourbeautystore", shippingFee: 5000 });
  }
  console.log("Seed complete");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
