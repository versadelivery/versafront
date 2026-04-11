import jsPDF from "jspdf";

interface ShopInfo {
  name: string;
  cellphone?: string | null;
  address?: string | null;
  email?: string | null;
  description?: string | null;
}

interface PdfOptions {
  includePhotos: boolean;
  includeDescriptions: boolean;
  includeReviews: boolean;
}

interface ReviewData {
  id: string;
  attributes: {
    rating: number;
    comment: string | null;
    customer_name: string | null;
    created_at: string;
  };
}

interface CatalogGroup {
  id: string;
  attributes: {
    name: string;
    description?: string;
    active?: boolean;
    items?: {
      data?: Array<{
        data?: {
          id: string;
          attributes: {
            name: string;
            description?: string;
            price: number;
            price_with_discount?: number | null;
            active?: boolean;
            image_url?: string | null;
          };
        };
      }>;
    };
  };
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateCatalogPdf(
  shopInfo: ShopInfo,
  groups: CatalogGroup[],
  options: PdfOptions,
  reviews: ReviewData[] = []
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // Header — shop name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(shopInfo.name, pageWidth / 2, y + 10, { align: "center" });
  y += 18;

  // Shop info lines
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);

  const infoLines: string[] = [];
  if (shopInfo.address) infoLines.push(shopInfo.address);

  const contactParts: string[] = [];
  if (shopInfo.cellphone) contactParts.push(formatPhone(shopInfo.cellphone));
  if (shopInfo.email) contactParts.push(shopInfo.email);
  if (contactParts.length > 0) infoLines.push(contactParts.join("  |  "));

  if (shopInfo.description) {
    const descLines = doc.splitTextToSize(shopInfo.description, contentWidth - 20);
    infoLines.push(...descLines.slice(0, 2));
  }

  for (const line of infoLines) {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 4.5;
  }

  y += 3;

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Helper: desenha N bolinhas preenchidas + (5-N) vazias para representar estrelas
  const drawStars = (rating: number, x: number, cy: number, color: [number, number, number]) => {
    const r = 1.2;
    const gap = 3.8;
    for (let i = 0; i < 5; i++) {
      const cx = x + i * gap;
      if (i < Math.round(rating)) {
        doc.setFillColor(...color);
        doc.circle(cx, cy, r, "F");
      } else {
        doc.setDrawColor(...color);
        doc.setLineWidth(0.25);
        doc.circle(cx, cy, r, "S");
      }
    }
    // retorna a largura ocupada
    return 5 * gap;
  };

  // Reviews section
  if (options.includeReviews && reviews.length > 0) {
    const positiveReviews = reviews.filter((r) => r.attributes.rating >= 4);
    const avgRating =
      reviews.reduce((s, r) => s + r.attributes.rating, 0) / reviews.length;

    checkPageBreak(40);

    // Título
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("AVALIA\u00c7\u00d5ES DOS CLIENTES", margin, y);
    y += 7;

    // Nota média: bolinhas + número + contagem
    drawStars(avgRating, margin, y - 1, [251, 191, 36]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(avgRating.toFixed(1), margin + 22, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 130, 130);
    doc.text(`(${reviews.length} avalia\u00e7\u00f5es)`, margin + 30, y);
    y += 7;

    // Comentários positivos (até 5)
    const withComments = positiveReviews
      .filter((r) => r.attributes.comment)
      .slice(0, 5);

    for (const review of withComments) {
      checkPageBreak(14);
      const name =
        review.attributes.customer_name?.split(" ")[0] || "Cliente";

      // Comentário em itálico
      const commentLines = doc.splitTextToSize(
        `"${review.attributes.comment}"`,
        contentWidth - 14
      );
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(80, 80, 80);
      doc.text(commentLines.slice(0, 2), margin + 4, y);
      y += commentLines.slice(0, 2).length * 3.8;

      // Estrelas do review + nome
      drawStars(review.attributes.rating, margin + 4, y - 1, [251, 191, 36]);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(`\u2014 ${name}`, margin + 26, y);
      y += 6;
    }

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  const activeGroups = groups.filter(
    (g) => g.attributes?.active !== false
  );

  for (const group of activeGroups) {
    const rawItems = group.attributes?.items;
    // items can be: array directly, or { data: [...] }
    const itemsList = Array.isArray(rawItems)
      ? rawItems
      : Array.isArray(rawItems?.data)
      ? rawItems.data
      : [];
    const activeItems = itemsList
      .map((i: any) => (i.data ? i.data : i))
      .filter((item: any) => item && item.attributes?.active !== false);

    if (activeItems.length === 0) continue;

    // Group header
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(group.attributes.name.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 30, y);
    y += 6;

    for (const item of activeItems) {
      if (!item) continue;
      const attrs = item.attributes;
      const itemHeight = options.includeDescriptions && attrs.description ? 18 : 10;
      const photoHeight = options.includePhotos && attrs.image_url ? 25 : 0;

      checkPageBreak(itemHeight + photoHeight + 5);

      const itemStartY = y;

      // Photo
      if (options.includePhotos && attrs.image_url) {
        try {
          const imgData = await loadImageAsBase64(attrs.image_url);
          if (imgData) {
            doc.addImage(imgData, "JPEG", margin, y, 20, 20);
          }
        } catch {
          // Skip image on error
        }
      }

      const textX = options.includePhotos && attrs.image_url ? margin + 24 : margin;
      const priceAreaWidth = 45;
      const nameMaxWidth = contentWidth - (textX - margin) - priceAreaWidth;

      // Item name
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      const nameLines = doc.splitTextToSize(attrs.name, nameMaxWidth);
      doc.text(nameLines, textX, y + 4);

      // Price
      const hasDiscount =
        attrs.price_with_discount != null && attrs.price_with_discount > 0;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      if (hasDiscount) {
        // Original price (strikethrough)
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const originalPrice = formatPrice(attrs.price);
        doc.text(originalPrice, pageWidth - margin, y + 3, { align: "right" });

        // Discount price
        doc.setTextColor(76, 175, 80);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          formatPrice(attrs.price_with_discount!),
          pageWidth - margin,
          y + 8,
          { align: "right" }
        );
      } else {
        doc.setTextColor(30, 30, 30);
        doc.text(formatPrice(attrs.price), pageWidth - margin, y + 4, {
          align: "right",
        });
      }

      y += nameLines.length * 5 + 2;

      // Description
      if (options.includeDescriptions && attrs.description) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        const descLines = doc.splitTextToSize(
          attrs.description,
          nameMaxWidth
        );
        const maxDescLines = descLines.slice(0, 2);
        doc.text(maxDescLines, textX, y + 2);
        y += maxDescLines.length * 3.5 + 1;
      }

      // Ensure minimum height for photo
      if (options.includePhotos && attrs.image_url) {
        y = Math.max(y, itemStartY + 22);
      }

      // Item separator
      y += 3;
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.2);
      doc.line(textX, y, pageWidth - margin, y);
      y += 4;
    }

    y += 4;
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  const today = new Date().toLocaleDateString("pt-BR");
  doc.text(`Gerado em ${today}`, pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  doc.save(
    `cardapio-${shopInfo.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}.pdf`
  );
}
