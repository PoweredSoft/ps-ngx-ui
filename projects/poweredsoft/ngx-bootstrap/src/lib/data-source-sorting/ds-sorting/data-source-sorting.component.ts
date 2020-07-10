import { Component, OnInit, Input } from '@angular/core';
import { IDataSource } from '@poweredsoft/data';

@Component({
  selector: 'psbx-ds-sorting',
  templateUrl: './data-source-sorting.component.html',
  styleUrls: ['./data-source-sorting.component.scss']
})
export class DataSourceSortingComponent implements OnInit {

  @Input() dataSource : IDataSource<any>;
  @Input() path:string; 
  isSorting: boolean =false; 
  isAscending:boolean = false;  
  constructor() { }

  ngOnInit(): void {
  }
  
  sorting(){
    this.isSorting = true;
    this.isAscending = !this.isAscending;
    const existingSort = this.dataSource.sorts.find(t => t.path == this.path);
    if (existingSort){
      existingSort.ascending = (this.isAscending)? true : false;
    }else{
      this.dataSource.sorts.push({
        path: this.path,
        ascending: (this.isAscending)? true : false 
      })
    }
    this.dataSource.query({
      sorts: this.dataSource.sorts,
      page: 1
    })
  }

}