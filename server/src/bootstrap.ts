import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { defaultSettings } from "./defaults";
import { PLATFORMS } from "./constants";
import { placeholderSvg, saveFromSource } from "./images";
import { seedImagesDir } from "./constants";

type SeedProduct = {
  title: string;
  subtitle: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  sources: string[];
};

const products: SeedProduct[] = [
  {
    title: "Chocolate en rama",
    subtitle: "Tableta artesanal",
    shortDesc: "200g",
    category: "chocolates",
    sources: ["p1.jpg", "p2.jpg"],
    fullDesc:
      "Tableta de chocolate en rama, con quiebre crocante y cacao intenso. Ideal para compartir o para regalar un clásico de la casa.\n\nSe elabora en pequeños lotes para conservar el brillo, el aroma y ese corte limpio que se disfruta de a poco.",
  },
  {
    title: "Bombones",
    subtitle: "Surtido clásico",
    shortDesc: "200g",
    category: "chocolates",
    sources: ["p2.jpg", "p3.jpg"],
    fullDesc:
      "Bombones de chocolate con leche y semiamargo, elaborados en pequeños lotes. Cada bocado guarda un centro suave y un cierre que se recuerda.\n\nUna caja para tener a mano cuando el día pide algo dulce.",
  },
  {
    title: "Cajas de bombones",
    subtitle: "Edición para regalar",
    shortDesc: "200g",
    category: "cajas",
    sources: ["p3.jpg", "p1.jpg"],
    fullDesc:
      "Caja surtida lista para regalar. Una selección equilibrada de rellenos, presentada como un momento dulce para alguien especial.\n\nPodés pedirla con dedicatoria y coordinar el envío por WhatsApp.",
  },
  {
    title: "Bombones rellenos",
    subtitle: "Centros cremosos",
    shortDesc: "200g",
    category: "chocolates",
    sources: ["p4.jpg", "p5.jpg"],
    fullDesc:
      "Bombones con rellenos cremosos de frutos secos, ganache y dulce de leche. Pensados para quienes buscan un bocado más intenso.\n\nLa cobertura se parte y el centro queda suave, sin exceso de dulzor.",
  },
  {
    title: "Bombones con frutos",
    subtitle: "Frutos secos seleccionados",
    shortDesc: "200g",
    category: "novedades",
    sources: ["p5.jpg", "p6.jpg"],
    fullDesc:
      "Chocolate y frutos secos tostados. Una combinación crocante, elegante y justa de sal y dulzor.\n\nEs una de las piezas que más se elige para compartir en la mesa.",
  },
  {
    title: "Bombones con ddl",
    subtitle: "Dulce de leche",
    shortDesc: "200g",
    category: "chocolates",
    sources: ["p6.jpg", "p2.jpg"],
    fullDesc:
      "El clásico que no falla: bombón de chocolate con corazón de dulce de leche. Cremoso, aromático y generoso.\n\nUn gusto de siempre, con la terminación cuidada de Mi Dulce Cata.",
  },
  {
    title: "Alfajores de maicena",
    subtitle: "Relleno de dulce de leche",
    shortDesc: "Caja x6",
    category: "alfajores",
    sources: ["p7.jpg", "p4.jpg"],
    fullDesc:
      "Alfajores de maicena bien húmedos, con dulce de leche repostero y un baño suave. El gusto de siempre, con la terminación de la casa.\n\nSe entregan en caja, listos para regalar o para el café de la tarde.",
  },
  {
    title: "Caja regalo premium",
    subtitle: "Para celebrar",
    shortDesc: "400g",
    category: "regalos",
    sources: ["p8.jpg", "p3.jpg"],
    fullDesc:
      "Una caja amplia para empresas, aniversarios y agradecimientos. Armamos el surtido según la ocasión y lo dejamos listo para entregar.\n\nConsultanos y te ayudamos a elegir cantidades, sabores y presentación.",
  },
];

async function importSeedImage(sourceName: string, label: string): Promise<string> {
  const source = path.join(seedImagesDir, sourceName);
  if (fs.existsSync(source)) {
    return saveFromSource(source, { cover: true, width: 1200, height: 900 });
  }
  return saveFromSource(placeholderSvg(label), { cover: true, width: 1200, height: 900 });
}

export async function bootstrap(): Promise<void> {
  const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (!existingUser) {
    let password = process.env.ADMIN_PASSWORD || "";
    let generated = false;
    if (!password) {
      password = crypto.randomBytes(9).toString("base64url");
      generated = true;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { username, passwordHash } });
    if (generated) {
      console.log(`Usuario administrador creado. Contraseña inicial: ${password}`);
    }
  }

  const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!settings) {
    await prisma.siteSetting.create({ data: defaultSettings });
  }

  for (const platform of PLATFORMS) {
    const current = await prisma.socialLink.findUnique({ where: { platform } });
    if (!current) {
      const defaults: Record<string, string> = {
        whatsapp: "https://wa.me/5491100000000",
        facebook: "https://www.facebook.com/midulcecata",
        instagram: "https://www.instagram.com/midulcecata",
      };
      await prisma.socialLink.create({
        data: { platform, url: defaults[platform] || "" },
      });
    }
  }

  const count = await prisma.product.count();
  if (count > 0) return;

  const hero = await importSeedImage("hero.jpg", "Mi Dulce Cata");
  const promo1 = await importSeedImage("promo1.jpg", "Regalos corporativos");
  const promo2 = await importSeedImage("promo2.jpg", "Regalos empresariales");
  await prisma.siteSetting.update({
    where: { id: "default" },
    data: { heroImage: hero, promo1Image: promo1, promo2Image: promo2 },
  });

  for (let index = 0; index < products.length; index += 1) {
    const item = products[index];
    const images = [];
    for (let imageIndex = 0; imageIndex < item.sources.length; imageIndex += 1) {
      const filename = await importSeedImage(item.sources[imageIndex], item.title);
      images.push({
        filename,
        alt: item.title,
        isPrimary: imageIndex === 0,
        sortOrder: imageIndex,
      });
    }
    await prisma.product.create({
      data: {
        title: item.title,
        subtitle: item.subtitle,
        shortDesc: item.shortDesc,
        fullDesc: item.fullDesc,
        category: item.category,
        slug: slugFromTitle(item.title, index),
        sortOrder: index,
        published: true,
        images: { create: images },
      },
    });
  }
}

function slugFromTitle(title: string, index: number): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${index + 1}`;
}
