import { Component, OnInit, ViewChild, Inject } from '@angular/core';
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
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm : FormGroup;
  comment: Comment;
  dishcopy : Dish;
  @ViewChild('cform') commentFormDirective;

  constructor(private fb : FormBuilder, private dishService: DishService, private route: ActivatedRoute ,private location: Location,
    @Inject('BaseURL') private BaseURL) { 
    this.createForm();
  }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds=dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe((dish) => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id)},
      errmess => this.errMess = <any>errmess );
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
      date:''
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
  this.comment = this.commentForm.value;
  this.comment.date = new Date().toISOString();
  this.dishcopy.comments.push(this.comment);
  this.dishService.putDish(this.dishcopy) 
    .subscribe(dish => {
      this.dish = dish; this.dishcopy = dish;
    },
    errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
  this.commentFormDirective.resetForm();
  this.commentForm.reset({
    author: '',
    rating: 5,
    comment: ''
  });
}





}
