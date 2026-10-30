export class Fashion {
  constructor(
    public _id: any = null,
    public style: string = '',
    public fashion_subject: string = '',
    public fashion_detail: string = '',
    public fashion_image: string = '',
    public title?: string,
    public detail?: string,
    public thumbnail?: string,
    public created_at?: string,
    public IdF?: number,
    public slug?: string
  ) {}

  getBase64String(): string {
    const img = this.thumbnail || this.fashion_image || '';
    if (!img) {
      return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
    }
    if (img.startsWith('data:image') || img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    return 'data:image/jpeg;base64,' + img;
  }

  getTitle(): string {
    return this.title || this.fashion_subject || 'Untitled Fashion';
  }

  getDetail(): string {
    return this.detail !== undefined ? this.detail : (this.fashion_detail || '');
  }

  /**
   * Chuyển đổi chuỗi tiếng Việt thành chuỗi slug không dấu (kebab-case)
   */
  static toSlug(text: string): string {
    if (!text) return '';
    let slug = text.toLowerCase().trim();
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
    slug = slug.replace(/\s+/g, '-');
    slug = slug.replace(/-+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
  }

  /**
   * Tạo Slug độc nhất cho Fashion: kết hợp tiêu đề không dấu và mã số IdF duy nhất.
   * Ví dụ: Tiêu đề "Áo Dài Cách Tân", IdF = 1 -> "ao-dai-cach-tan-1"
   */
  static createSlug(title: string, idf?: number): string {
    const baseSlug = Fashion.toSlug(title);
    if (idf !== undefined && idf !== null && idf > 0) {
      const suffix = `-${idf}`;
      if (!baseSlug.endsWith(suffix)) {
        return baseSlug ? `${baseSlug}${suffix}` : `${idf}`;
      }
    }
    return baseSlug || (idf !== undefined && idf !== null ? `${idf}` : 'fashion');
  }

  /**
   * Tự động phân tích (parse) Slug:
   * Tách chuỗi slug đầu vào để lấy ra IdF kiểu số và baseSlug tương ứng.
   * Ví dụ: "ao-dai-cach-tan-1" -> { idf: 1, baseSlug: "ao-dai-cach-tan" }
   */
  static parseSlug(slug: string): { idf: number | null; baseSlug: string } {
    if (!slug) return { idf: null, baseSlug: '' };
    const clean = slug.trim().toLowerCase();

    const trailingMatch = clean.match(/^(.*?)-(\d+)$/);
    if (trailingMatch) {
      return {
        idf: parseInt(trailingMatch[2], 10),
        baseSlug: trailingMatch[1],
      };
    }

    const leadingMatch = clean.match(/^(\d+)-(.*)$/);
    if (leadingMatch) {
      return {
        idf: parseInt(leadingMatch[1], 10),
        baseSlug: leadingMatch[2],
      };
    }

    if (/^\d+$/.test(clean)) {
      return {
        idf: parseInt(clean, 10),
        baseSlug: clean,
      };
    }

    return {
      idf: null,
      baseSlug: clean,
    };
  }
}