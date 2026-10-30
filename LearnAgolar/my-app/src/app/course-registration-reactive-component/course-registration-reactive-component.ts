import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-course-registration-reactive-component',
  standalone: false,
  styleUrl: './course-registration-reactive-component.css',
  templateUrl: './course-registration-reactive-component.html',
})
export class CourseRegistrationReactiveComponent {
  public regForm: FormGroup = new FormGroup(
    {
      name: new FormControl('Đặng Quỳnh Nhi',
        [Validators.required, Validators.minLength(3), this.customNameValidator.bind(this)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
      ]),
      confirmPass: new FormControl('', [Validators.required])
    },
    { validators: this.passwordMatchValidator }
  );
  setDefaultValues() {
    this.regForm.patchValue({
      name: 'Trần Duy Thanh',
      email: 'thanhtd@uel.edu.vn'
    });
  }
  customNameValidator(control: AbstractControl): { [key: string]: any } | null
  {
    // Biểu thức chính quy kiểm tra các ký tự: @, #, $, %, ^, &
    const matchName = /[@#$%^&]/g.test(control.value);

    // Nếu tìm thấy ký tự đặc biệt, trả về object chứa lỗi 'nameNotMatch'
    // Ngược lại trả về null (hợp lệ)
    return matchName ? { 'nameNotMatch': { value: control.value } } : null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPass = control.get('confirmPass')?.value;

    return password && confirmPass && password !== confirmPass
      ? { mismatch: true }
      : null;
  }
    onSubmit() {
    if (this.regForm.valid) {
      console.log('Dữ liệu gửi đi:', this.regForm.value);
      let infor=JSON.stringify(this.regForm.value);
      alert("Xử lý dữ liệu:\n"+infor)
    }
  }


  
}
