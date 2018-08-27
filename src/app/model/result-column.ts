export class ResultColumn {
    public name: string;
    public title: string;
    public sort: any;
    public show: boolean;
    
    constructor (name: string, title: string, sort='', show=false) {
        this.name = name;
        this.title = title;
        this.sort = sort;
        this.show = show;
    }
}