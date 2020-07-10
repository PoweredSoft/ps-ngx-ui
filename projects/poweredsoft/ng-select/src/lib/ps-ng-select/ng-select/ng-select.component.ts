import { Component, OnInit, ContentChild, ViewChild, Input, Output, EventEmitter, ChangeDetectorRef, forwardRef, OnDestroy } from '@angular/core';
import { SelectLabelTemplateDirective } from '../directives/select-label-template.directive';
import { IDataSource, ISimpleFilter } from '@poweredsoft/data';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { NgSelectComponent as SelectComponent } from '@ng-select/ng-select';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOptionTemplateDirective } from '../directives/select-option-template.directive';
import { NotFoundTemplateDirective } from '../directives/not-found-template.directive';


@Component({
  selector: 'ps-ng-select',
  templateUrl: './ng-select.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgSelectComponent),
    multi: true
}],
  styleUrls: ['./ng-select.component.scss']
})
export class NgSelectComponent implements OnInit,OnDestroy {

  @ContentChild(SelectOptionTemplateDirective) optionTemplate: SelectOptionTemplateDirective;
  @ContentChild(SelectLabelTemplateDirective) labelTemplate: SelectLabelTemplateDirective;
  @ContentChild(NotFoundTemplateDirective) notFoundTemplate: NotFoundTemplateDirective;


  
  @ViewChild(SelectComponent, { static: true }) selectComponent: SelectComponent;
  @Input() dataSource: IDataSource<any>;
  @Input() searchPath: string;
  @Input() searchType: string;
  @Input() sortingPath: string;
  @Input() serverFiltering:boolean;
  @Input() bindLabel:string;
  @Input() bindValue: string;

  @Output('change') changeEvent = new EventEmitter();

  trackFn: (item: any) => any;
  data$ : Observable<any[]>;
  isLoading:boolean = false;
  searchInput$ = new Subject<string>();

  private _loadingSubscription: Subscription;  

  constructor(private cdr: ChangeDetectorRef) {    
    this.trackFn = this.trackBy.bind(this);
  
  }

  ngOnInit(): void {
    this.dataFetching();    
    this.detectLoading();

    if(this.serverFiltering){
      this.searchOnServer();
    }else{
      this.refreshDataSource();
    }
  }

 
  valueChanged(event) {
    this.changeEvent.emit(event);
  }

  writeValue(obj: any): void {
    this.selectComponent.writeValue(obj);
  }
  registerOnChange(fn: any): void {
    this.selectComponent.registerOnChange(fn);
  }
  registerOnTouched(fn: any): void {
    this.selectComponent.registerOnTouched(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    if (this.selectComponent.setDisabledState)
      this.selectComponent.setDisabledState(isDisabled);
  }

  trackBy(item: any) {
    return this.dataSource.resolveIdField(item);
  }

  ngOnDestroy(): void {
    this._loadingSubscription.unsubscribe();
  }


  dataFetching(){
    this.data$ = this.dataSource.data$.pipe(
      map(t => {
        if (t == null)        
          return [];
        return t.data;
      })
    );
  }

  detectLoading(){
    this._loadingSubscription = this.dataSource.loading$.subscribe(loading => {      
      this.isLoading = loading;
      this.cdr.detectChanges();
    });
  }

  searchOnServer(){
    this.searchInput$.pipe(
      distinctUntilChanged(), // emit the difference from previous input
      debounceTime(500)  // this is for delaying searching speed
    ).subscribe(searchTerm => this.refreshDataSource(searchTerm, 1, 100)); // page: 1, pageSize: 50

    this.refreshDataSource(); //send the query to server to sorting & filtering by default
  }

  get selectedModel() {    
    return this.selectComponent.hasValue ? this.selectComponent.selectedItems[0] : null;
  }

  refreshDataSource(searchTerm:any = null, page:number = null, pageSize:number = null){
    let searchfilters:ISimpleFilter[] = null;
    if(searchTerm){
      searchfilters = [<ISimpleFilter>{
        path: this.searchPath || this.bindLabel,      
        type: this.searchType || 'Contains', // Default: Contains
        value: searchTerm
      }]
    }
    this.dataSource.query({
      page: page,
      pageSize: pageSize,
      filters:searchfilters,
      sorts:[
        {path: this.sortingPath || this.bindLabel, ascending: true} 
      ]
    })
  }

  get hasOptionTemplate() {    
    return this.optionTemplate ? true : false;
  }

  get selectOptionTemplate(){
    if (this.optionTemplate)    
      return this.optionTemplate.template;
    return null;
  }

  get hasLabelTemplate() {
    return this.labelTemplate ? true : false;
  }

  get selectLabelTemplate(){
    if (this.labelTemplate)    
      return this.labelTemplate.template;
    return null;
  }

  get hasNotFoundTemplate() {
    return this.notFoundTemplate ? true : false;
  }

  get selectNotFoundTemplate(){
    if(this.notFoundTemplate)
      return this.notFoundTemplate.template;
    return null;
  }
}
