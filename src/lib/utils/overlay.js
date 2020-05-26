import { Overlay } from 'ol'
import React from 'react'
import { transform } from 'ol/proj'
import InitMap from '../../utils/INITMAP'

const id = 'aaaaaa'
class DefineOverlay extends React.Component {
    constructor(props) {
        super(props)
        // console.log('Overlay', AA)
        // this.OL = { ...AA }

    }
}


export default class TestUI extends DefineOverlay {
    #O_L ;

    constructor(props) {

        super(props)
        this.OL = new Overlay({ id })
        // this.#O_L = this.OL
        InitMap.map.addOverlay(this.OL)
        // console.log('Overlay', AA)

        this.state = {
            name: "123"
        }
        console.log('Overlay', this)
        this.#O_L = 0;
    }

    componentDidMount() {
        let coor = transform([113.98058039281737, 22.54161773376623], 'EPSG:4326', 'EPSG:3857')
        this.OL.setElement(document.querySelector(`#${id}`))
        this.OL.setPosition(coor);
    }

    static A() {
        // console.dir(this.#O_L);
    }
    render() {
        return (
            <div id={id}>
                <span onClick={() => { this.setState({ name: "2233点击了我" }) }}>{this.state.name}</span>
            </div>
        )
    }
}
