import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonserviceService } from '../services/commonservice.service';
import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';
import { v4 as uuidv4 } from 'uuid'; // univerally unique identifier
declare const M;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  taskManager: FormGroup;
  taskArr = [];
  progressTask = [];
  completedTask = [];
  title: string;
  desc: string; // name for storing the value of input box
  priority;
  date = null;
  selectedItem: any;
  score;
  status;
  submitted = false;
  innerWidth;
  @HostListener('window: resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 991) {
      document.addEventListener('DOMContentLoaded', () => {
        const elems = document.querySelectorAll('.fixed-action-btn');
        // clickable class to floating buttons
        for (var i = 0; i < elems.length; ++i) {
          elems[i].classList.add('click-to-toggle');
        }
        let instances = M.FloatingActionButton.init(elems, {
          direction: 'top',
          hoverEnabled: false
        });
      });
    }
  }
  constructor(
    private commonService: CommonserviceService,
    private fb: FormBuilder) {

    // tslint:disable-next-line: only-arrow-functions
    document.addEventListener('DOMContentLoaded', function () {
      let elems = document.querySelectorAll('.sidenav');
      let instances = M.Sidenav.init(elems, {});
    });

    document.addEventListener('DOMContentLoaded', function () {
      let elems = document.querySelectorAll('.modal');
      let instances = M.Modal.init(elems, {});
    });

    // Date Picker
    document.addEventListener('DOMContentLoaded', function () {
      let elems = document.querySelectorAll('.datepicker');
      let instances = M.Datepicker.init(elems, {});
    });

    // Selector
    document.addEventListener('DOMContentLoaded', function () {
      let elems = document.querySelectorAll('select');
      let instances = M.FormSelect.init(elems, {});
    });

    // Tooltip
    document.addEventListener('DOMContentLoaded', function () {
      let elems = document.querySelectorAll('.tooltipped');
      let instances = M.Tooltip.init(elems, {});
    });

    // Floating Button
    document.addEventListener('DOMContentLoaded', function () {
      var elems = document.querySelectorAll('.fixed-action-btn');
      var instances = M.FloatingActionButton.init(elems, {});
    });
    // Get the modal
    let modal = document.getElementById('myModal');

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };

  }

  get f() { return this.taskManager.controls; }

  ngOnInit() {
    this.taskManager = this.fb.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
      date: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required],
    });
    // Get data from localStorage
    this.getDataFromLocal();
    // Get Score
    this.getCompletedTaskLen();
  }

  getDataFromLocal() {
    const storageData = this.commonService.getDataFromLocal('task');
    if (storageData) {
      this.taskArr = storageData.sort((a, b) => {
        const dateA: any = new Date(a.date);
        const dateB: any = new Date(b.date);
        return dateB - dateA;
      });
    }
  }

  openModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'flex';
  }

  // add the new task
  addTask() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.taskManager.invalid) {
      return;
    } else {
      const values = this.taskManager.value;
    }

    // updation case
    if (this.selectedItem && this.selectedItem.isEdit) {
      this.selectedItem.title = this.title;
      this.selectedItem.desc = this.desc;
      this.selectedItem.priority = this.priority;
      this.selectedItem.date = new Date(this.date);
      this.selectedItem.status = this.status;
      this.selectedItem.isEdit = false;

      const findObjInd = this.taskArr.findIndex(item => item._id === this.selectedItem._id);
      this.taskArr[findObjInd] = this.selectedItem;
      this.setDataToLocal(this.taskArr, 'update');
    } else {
      const taskObj = {
        title: this.title,
        desc: this.desc,
        priority: this.priority,
        status: this.status,
        date: new Date(this.date),
        isEdit: false,
        _id: uuidv4()
      };
      this.taskArr.push(taskObj);
      this.setDataToLocal(this.taskArr, 'add');
      this.title = '';
      this.desc = '';
      this.priority = '';
      this.date = '';
      this.status = '';
    }
  }

  setDataToLocal(data, action: string) {
    localStorage.clear();
    localStorage.setItem('task', JSON.stringify(data));
    this.getDataFromLocal();
    this.getCompletedTaskLen();
    if (action === 'add') {
      const toastHTML = '<span>Task created successfully</span>';
      M.toast({ html: toastHTML, classes: 'rounded success' });
    } else if (action === 'update') {
      const toastHTML = '<span>Task updated successfully</span>';
      M.toast({ html: toastHTML, classes: 'rounded update' });
    } else if (action === 'delete') {
      const toastHTML = '<span>Task deleted successfully</span>';
      M.toast({ html: toastHTML, classes: 'rounded delete' });
    }
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }

  getCompletedTaskLen() {
    const completeTaskLen = this.taskArr.filter(item => item.status === 'Completed').length;
    this.score = ((completeTaskLen / this.taskArr.length) * 100).toFixed(2);
  }

  closeModal() {
    this.title = '';
    this.desc = '';
    this.priority = null;
    this.date = null;
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }

  visibleStatus() {
    return this.selectedItem && this.selectedItem.status;
  }
  // edit the task
  editTask(selectedObj) {
    this.selectedItem = selectedObj;
    selectedObj.isEdit = true;
    const modal = document.getElementById('myModal');
    modal.style.display = 'flex';
    this.title = selectedObj.title;
    this.desc = selectedObj.desc;
    this.priority = selectedObj.priority;
    this.status = selectedObj.status;
    this.date = selectedObj.date;
    this.taskManager.patchValue({
      title: selectedObj && selectedObj.title || '',
      desc: selectedObj && selectedObj.desc || '',
      priority: selectedObj && selectedObj.priority || '',
      status: selectedObj && selectedObj.status || '',
      date: selectedObj && selectedObj.date,
    });
  }

  // delete the task
  deleteTask(index: number) {
    this.taskArr.splice(index, 1);
    this.setDataToLocal(this.taskArr, 'delete');
  }


  inProg() {
    if (!this.selectedItem) {
      alert('please select row');
    }
    const localData = JSON.parse(localStorage.getItem('task'));
    if (localData) {
      const findObj = localData.find(item => item.title === this.selectedItem.title);
    }
    this.selectedItem.currentStatus = 'Progress';
    this.taskArr.filter(item => item.currentStatus !== 'Completed');
  }

  completed() {
    if (!this.selectedItem) {
      alert('please select row');
    }
    this.selectedItem.currentStatus = 'Completed';
  }
}
