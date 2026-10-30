import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CourseRegistration } from '../classes/CourseRegistration';

@Component({
  selector: 'app-course-registration-component',
  standalone: false,
  styleUrl: './course-registration-component.css',
  templateUrl: './course-registration-component.html',
})
export class CourseRegistrationComponent {
  // onSubmit(form:NgForm)
  // {
  //   if(form.valid)
  //   {
  //     alert(JSON.stringify(form.value))
  //     let info = form.value
  //     alert(info.email)
  //   }
  // }
  courseModel=new CourseRegistration();
  onSubmit()
  {
    let infor=this.courseModel.getInfor()
    console.log('Dữ liệu khóa học:', this.courseModel.getInfor())
    alert(infor)
  }
}
