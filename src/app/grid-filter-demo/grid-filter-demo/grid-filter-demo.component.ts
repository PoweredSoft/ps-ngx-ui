import { Component, OnInit } from '@angular/core';
import { IDataSource } from '@poweredsoft/data';
import { IMerchant } from 'src/app/data/services/IMerchant';
import { MerchantService } from 'src/app/data/services/merchant.service';
import { ConfirmModalService } from '@poweredsoft/ngx-bootstrap';

@Component({
  selector: 'ps-grid-filter-demo',
  templateUrl: './grid-filter-demo.component.html',
  styleUrls: ['./grid-filter-demo.component.scss']
})
export class GridFilterDemoComponent implements OnInit {

  columns = ['id','name', 'address','commands']
  merchantDataSource: IDataSource<IMerchant>;  
  constructor(private  merchantService: MerchantService){
    this.merchantDataSource = this.createDataSource();
    console.log(this.merchantDataSource);    
  }

  pages:any;
  filteredResults:any;
  somefilter:any;
  
  createDataSource(): IDataSource<IMerchant> {
    return this.merchantService.createDataSource();
   
  }

  ngOnInit() {
    this.merchantDataSource.refresh();
    
  }

  filterMerchants(event){
    this.somefilter = event;
    this.merchantDataSource.filters[0]=this.somefilter;    
    this.merchantDataSource.refresh();
  }
}
