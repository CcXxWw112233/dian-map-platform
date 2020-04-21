import { addFeature, VectorSource, VectorLayer } from '../../lib/utils'
import { publicDataUrl } from '../../services/publicData'

const publicData = {
    layer: VectorSource,
    source: VectorLayer,
    features:[],
    getPublicData:function(){
        publicDataUrl.request('GET',publicDataUrl.GET_GEO_DATA).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }
}
export default publicData;

