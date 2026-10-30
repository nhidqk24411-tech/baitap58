export class FashionSlug {
  constructor(
    public _id: any = null,
    public IdF: number = 0,
    public style: string = '',
    public fashion_subject: string = '',
    public fashion_detail: string = '',
    public fashion_image: string = '',
    public slug: string = ''
  ) {
    // Tự động tạo slug kết hợp giữa tiêu đề không dấu và mã số duy nhất IdF
    if (!this.slug && this.fashion_subject) {
      this.slug = FashionSlug.createSlug(this.fashion_subject, this.IdF);
    }
  }

  /**
   * Chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu cơ bản (kebab-case).
   * Ví dụ: "Bộ Sưu Tập Áo Dài 2026" -> "bo-suu-tap-ao-dai-2026"
   */
  static toSlug(text: string): string {
    if (!text) return '';
    let slug = text.toLowerCase().trim();

    // Thay thế các ký tự tiếng Việt có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');

    // Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ cái thường, số, dấu cách và dấu gạch nối
    slug = slug.replace(/[^a-z0-9\s-]/g, '');

    // Đổi khoảng trắng thành gạch ngang
    slug = slug.replace(/\s+/g, '-');

    // Thu gọn nhiều dấu gạch ngang liên tiếp
    slug = slug.replace(/-+/g, '-');

    // Cắt bỏ gạch ngang ở đầu và cuối chuỗi
    slug = slug.replace(/^-+|-+$/g, '');

    return slug;
  }

  /**
   * Tạo Slug độc nhất cho Fashion: kết hợp tiêu đề không dấu và mã số IdF duy nhất.
   * Ví dụ: Fashion có tiêu đề "Áo Dài Cách Tân", IdF = 1
   * -> Kết quả slug: "ao-dai-cach-tan-1"
   * Điều này đảm bảo Slug không bao giờ bị trùng nhau ngay cả khi có 2 mẫu trùng tên.
   */
  static createSlug(title: string, idf?: number): string {
    const baseSlug = FashionSlug.toSlug(title);
    if (idf !== undefined && idf !== null && idf > 0) {
      // Nếu baseSlug chưa có đuôi -{idf} thì gắn thêm vào
      const suffix = `-${idf}`;
      if (!baseSlug.endsWith(suffix)) {
        return baseSlug ? `${baseSlug}${suffix}` : `${idf}`;
      }
    }
    return baseSlug || (idf !== undefined && idf !== null ? `${idf}` : 'fashion');
  }

  /**
   * Hàm tự phân tích (parse) Slug:
   * Tách chuỗi slug đầu vào để lấy ra IdF kiểu số và baseSlug tương ứng.
   * Ví dụ:
   *  - "ao-dai-cach-tan-1" -> { idf: 1, baseSlug: "ao-dai-cach-tan" }
   *  - "1-ao-dai-cach-tan" -> { idf: 1, baseSlug: "ao-dai-cach-tan" }
   *  - "ao-dai-cach-tan"   -> { idf: null, baseSlug: "ao-dai-cach-tan" }
   */
  static parseSlug(slug: string): { idf: number | null; baseSlug: string } {
    if (!slug) return { idf: null, baseSlug: '' };
    const clean = slug.trim().toLowerCase();

    // 1. Dạng phổ biến nhất: {baseSlug}-{IdF} (ví dụ: ao-dai-cach-tan-1)
    const trailingMatch = clean.match(/^(.*?)-(\d+)$/);
    if (trailingMatch) {
      return {
        idf: parseInt(trailingMatch[2], 10),
        baseSlug: trailingMatch[1],
      };
    }

    // 2. Dạng tiền tố: {IdF}-{baseSlug} (ví dụ: 1-ao-dai-cach-tan)
    const leadingMatch = clean.match(/^(\d+)-(.*)$/);
    if (leadingMatch) {
      return {
        idf: parseInt(leadingMatch[1], 10),
        baseSlug: leadingMatch[2],
      };
    }

    // 3. Dạng chỉ chứa số IdF: "1"
    if (/^\d+$/.test(clean)) {
      return {
        idf: parseInt(clean, 10),
        baseSlug: clean,
      };
    }

    // 4. Dạng slug thông thường không có số
    return {
      idf: null,
      baseSlug: clean,
    };
  }

  /**
   * Phương thức tạo instance FashionSlug từ dữ liệu JSON
   */
  static fromJson(json: any, fallbackIdF: number = 1): FashionSlug {
    const title = json.fashion_subject || json.title || 'Thời Trang Mới';
    let idf = json.IdF !== undefined && json.IdF !== null ? Number(json.IdF) : fallbackIdF;
    if (isNaN(idf) || idf <= 0) {
      idf = fallbackIdF;
    }

    // Nếu JSON đã có slug hợp lệ và chứa idf thì dùng, ngược lại tạo mới theo createSlug(title, idf)
    let slug = json.slug && json.slug.trim().length > 0 ? json.slug.trim() : '';
    if (!slug) {
      slug = FashionSlug.createSlug(title, idf);
    } else {
      // Đảm bảo slug có đuôi IdF nếu chưa có
      const parsed = FashionSlug.parseSlug(slug);
      if (parsed.idf === null) {
        slug = FashionSlug.createSlug(slug, idf);
      }
    }

    return new FashionSlug(
      json._id || null,
      idf,
      json.style || 'STREET STYLE',
      title,
      json.fashion_detail || json.detail || '',
      json.fashion_image || json.thumbnail || '',
      slug
    );
  }

  /**
   * Chuẩn hóa URL ảnh hoặc chuỗi Base64
   */
  getBase64String(): string {
    if (!this.fashion_image) {
      return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80';
    }
    if (
      this.fashion_image.startsWith('http://') ||
      this.fashion_image.startsWith('https://') ||
      this.fashion_image.startsWith('assets/') ||
      this.fashion_image.startsWith('/')
    ) {
      return this.fashion_image;
    }
    if (!this.fashion_image.startsWith('data:image')) {
      return 'data:image/png;base64,' + this.fashion_image;
    }
    return this.fashion_image;
  }
}
