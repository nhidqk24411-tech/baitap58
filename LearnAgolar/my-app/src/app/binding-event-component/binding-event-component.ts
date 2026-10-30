import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-event-component',
  standalone: false,
  styleUrl: './binding-event-component.css',
  templateUrl: './binding-event-component.html',
})
export class BindingEventComponent {
  public hsa:number=5
  public hsb:number=8
  giaiPt(hsa:string,hsb:string,view:HTMLElement)
  {
    let a=parseFloat(hsa)
    let b=parseFloat(hsb)
    if(a==0 && b==0)
    {
      view.innerHTML="VSN"
    }
    else if (a==0 && b != 0)
    {
      view.innerHTML="<font color='red'>Không tìm ra nghiệm nha</font>"
    }
    else
    {
      view.innerHTML="x="+(-b/a)
    }
    let tdketqua2=document.getElementById("tdketqua2")
    //tdketqua2.innerHTML=""
  }
}
