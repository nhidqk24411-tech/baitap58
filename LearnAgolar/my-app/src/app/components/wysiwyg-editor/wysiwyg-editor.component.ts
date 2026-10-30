import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wysiwyg-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wysiwyg-editor.component.html',
  styleUrl: './wysiwyg-editor.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WysiwygEditorComponent),
      multi: true
    }
  ]
})
export class WysiwygEditorComponent implements ControlValueAccessor, OnChanges {
  @Input() value: string = '';
  @Input() placeholder: string = 'Nhập nội dung chi tiết bài viết thời trang tại đây...';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('editorArea') editorArea!: ElementRef<HTMLDivElement>;

  isSourceMode = false;
  activeTab: 'edit' | 'preview' = 'edit';
  rawHtml = '';
  wordCount = 0;
  charCount = 0;

  selectedFormat = 'p';
  selectedFont = 'sans-serif';
  selectedSize = '16px';
  textColor = '#0f172a';
  bgColor = '#ffffff';

  showLinkModal = false;
  linkUrl = '';
  linkText = '';

  showTableModal = false;
  tableRows = 3;
  tableCols = 3;

  showImageModal = false;
  imageUrl = '';
  imageAlt = '';

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      if (this.editorArea && this.editorArea.nativeElement.innerHTML !== this.value) {
        this.editorArea.nativeElement.innerHTML = this.value || '';
        this.rawHtml = this.value || '';
        this.updateCounts();
      }
    }
  }

  writeValue(val: string): void {
    this.value = val || '';
    this.rawHtml = val || '';
    if (this.editorArea) {
      this.editorArea.nativeElement.innerHTML = this.value;
    }
    this.updateCounts();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onContentInput(): void {
    if (this.editorArea) {
      this.value = this.editorArea.nativeElement.innerHTML;
      this.rawHtml = this.value;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
      this.updateCounts();
    }
  }

  onRawHtmlChange(): void {
    this.value = this.rawHtml;
    if (this.editorArea) {
      this.editorArea.nativeElement.innerHTML = this.rawHtml;
    }
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.updateCounts();
  }

  execCommand(command: string, value: string | undefined = undefined): void {
    if (this.isSourceMode) return;
    this.editorArea?.nativeElement.focus();
    document.execCommand(command, false, value);
    this.onContentInput();
  }

  formatBlock(tag: string): void {
    this.execCommand('formatBlock', tag);
  }

  applyFont(font: string): void {
    this.execCommand('fontName', font);
  }

  applySize(size: string): void {
    this.execCommand('fontSize', '7');
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      try {
        range.surroundContents(span);
      } catch {
        document.execCommand('fontSize', false, '4');
      }
    }
    this.onContentInput();
  }

  applyTextColor(color: string): void {
    this.execCommand('foreColor', color);
  }

  applyBgColor(color: string): void {
    this.execCommand('hiliteColor', color);
  }

  toggleSourceMode(): void {
    this.isSourceMode = !this.isSourceMode;
    if (!this.isSourceMode && this.editorArea) {
      this.editorArea.nativeElement.innerHTML = this.rawHtml;
    } else {
      this.rawHtml = this.value;
    }
  }

  setTab(tab: 'edit' | 'preview'): void {
    this.activeTab = tab;
    if (tab === 'edit' && this.editorArea) {
      setTimeout(() => {
        this.editorArea.nativeElement.innerHTML = this.value;
      }, 0);
    }
  }

  openLinkDialog(): void {
    const sel = window.getSelection();
    this.linkText = sel?.toString() || '';
    this.linkUrl = 'https://';
    this.showLinkModal = true;
  }

  insertLink(): void {
    if (this.linkUrl && this.linkUrl.trim().length > 0) {
      if (this.linkText && this.linkText.trim().length > 0) {
        const aHtml = `<a href="${this.linkUrl.trim()}" target="_blank" rel="noopener noreferrer">${this.linkText.trim()}</a>`;
        this.execCommand('insertHTML', aHtml);
      } else {
        this.execCommand('createLink', this.linkUrl.trim());
      }
    }
    this.showLinkModal = false;
    this.linkUrl = '';
    this.linkText = '';
  }

  openImageDialog(): void {
    this.imageUrl = '';
    this.imageAlt = '';
    this.showImageModal = true;
  }

  insertImageUrl(): void {
    if (this.imageUrl && this.imageUrl.trim().length > 0) {
      const imgHtml = `<figure style="margin: 1.5rem 0; text-align: center;"><img src="${this.imageUrl.trim()}" alt="${this.imageAlt || 'Fashion Image'}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"/><figcaption style="font-size: 0.85rem; color: #64748b; margin-top: 0.5rem; font-style: italic;">${this.imageAlt || ''}</figcaption></figure>`;
      this.execCommand('insertHTML', imgHtml);
    }
    this.showImageModal = false;
  }

  onImageFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const imgHtml = `<figure style="margin: 1.5rem 0; text-align: center;"><img src="${base64}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"/><figcaption style="font-size: 0.85rem; color: #64748b; margin-top: 0.5rem; font-style: italic;">${file.name}</figcaption></figure>`;
        this.execCommand('insertHTML', imgHtml);
        this.showImageModal = false;
      };
      reader.readAsDataURL(file);
    }
  }

  openTableDialog(): void {
    this.tableRows = 3;
    this.tableCols = 3;
    this.showTableModal = true;
  }

  insertTable(): void {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid #cbd5e1;">';
    for (let r = 0; r < this.tableRows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < this.tableCols; c++) {
        if (r === 0) {
          tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; background: #f8fafc; font-weight: bold; text-align: left;">Cột ${c + 1}</th>`;
        } else {
          tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Dữ liệu (${r}, ${c + 1})</td>`;
        }
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table><p></p>';
    this.execCommand('insertHTML', tableHtml);
    this.showTableModal = false;
  }

  private updateCounts(): void {
    const text = this.editorArea?.nativeElement.innerText || '';
    this.charCount = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean);
    this.wordCount = words.length;
  }
}
