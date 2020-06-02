import PhotoSwipe from 'photoswipe/dist/photoswipe'
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'

function Action (){

    this.show = (urls,data = {})=>{
        
        var pswpElement = document.querySelectorAll('.pswp')[0];

        // build items array
        var items = urls || [
            {
                src: 'https://placekitten.com/600/400',
                w: 600,
                h: 400
            },
            {
                src: 'https://placekitten.com/1200/900',
                w: 1200,
                h: 900
            }
        ];

        // define options (if needed)
        var options = {
            // optionName: 'option value'
            // for example:
            index: 0, // start at first slide
            ...data
        };
        this.PhotoSwipe = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        this.PhotoSwipe.init();
    }
    // Initializes and opens PhotoSwipe
}

let defaultAction = new Action();
export default defaultAction;
