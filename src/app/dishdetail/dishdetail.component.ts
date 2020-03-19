import { Component, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm : FormGroup;
  comment: Comment;
  @ViewChild('cform') commentFormDirective;

  constructor(private fb : FormBuilder, private dishService: DishService, private route: ActivatedRoute ,private location: Location) { 
    this.createForm();
  }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds=dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe((dish) => { this.dish = dish; this.setPrevNext(dish.id)});
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index-1) % (this.dishIds.length)];
    this.next = this.dishIds[(this.dishIds.length + index+1) % (this.dishIds.length)];
  }

  goBack(){
    this.location.back();
  }

  formErrors = {
    author: '',
    comment: ''
  };

  validationMessages= {
    'author': {
      'required':'Author Name is required.',
      'minlength':'Author Name must be atleast 2 characters'
    },
    'comment': {
      'required':'Comment is required.'
    }, 
  };

  createForm()
  {
    this.commentForm = this.fb.group({
      author: ['',[Validators.required,Validators.minLength(2)]],
      rating : 5,
      comment: ['', Validators.required],
      date: (new Date()).toISOString()
    });
  
    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

  this.onValueChanged(); //(re)set form validation messages
}

onValueChanged(data?: any) {
  if(!this.commentForm) {return;}
  const form = this.commentForm;
  for(const field in this.formErrors) {
    if(this.formErrors.hasOwnProperty(field)) {
      //clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if(control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for(const key in control.errors) {
          if(control.errors.hasOwnProperty(key)) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    }
  }
}

onSubmit() {
  this.dish.comments.push(this.commentForm.value);
  this.comment = this.commentForm.value;
  console.log(this.comment);
  this.commentFormDirective.resetForm();
  this.commentForm.reset({
    author: '',
    rating: 5,
    comment: ''
  });
}





}
