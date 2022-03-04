import { ThisReceiver } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { map } from 'rxjs';

interface MarcadorColor{
  color: string;
  marcador?: mapboxgl.Marker;
  centro?: [number, number]
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [`
    .mapa-container {
      width:100%;
      height:100%
    }
    .list-group {
      position:fixed;
      top:20px;
      right:20px;
      z-index:999999
    }
    li {
      cursor: pointer
    }
  `
  ]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef
  mapa!: mapboxgl.Map;  
  zoomLevel: number = 15;
  center: [number,number] = [ -71.30985276774284 , -34.291875323377496]
  
  //array marcadores
  marcadores: MarcadorColor[] = []


  constructor() { }

  ngAfterViewInit(): void {

    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });

    this.leerLocalStorage()
  }
  

  agregarMarcador(){

    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
    
    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true, 
      color: color
    })
      .setLngLat( this.center )
      .addTo( this.mapa )
    
    this.marcadores.push( {
      color,
      marcador: nuevoMarcador
    } )

    this.guardarMarcadoresLS()

    nuevoMarcador.on('dragend', () =>{
      this.guardarMarcadoresLS();
    })
  }

  irMarcador(marcador: mapboxgl.Marker){
    this.mapa.flyTo({
      center: marcador.getLngLat()
    })
  }

  guardarMarcadoresLS(){
    const lngLatArr: MarcadorColor[] = []

    this.marcadores.forEach( m => {
      const color = m.color;
      const { lng ,lat } = m.marcador!.getLngLat();
      
      lngLatArr.push({
        color: color,
        centro: [lng,lat],
      })
    })

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr))
  }

  leerLocalStorage(){
    if( !localStorage.getItem('marcadores') ){
      return;
    }
    
    const lngLatArr: MarcadorColor[] = JSON.parse(localStorage.getItem('marcadores')!)

    lngLatArr.forEach (m => {
      const newMarcador = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      })
        .setLngLat( m.centro! )
        .addTo ( this.mapa )

      this.marcadores.push({
        marcador: newMarcador,
        color: m.color
      })

      newMarcador.on('dragend', () =>{
        this.guardarMarcadoresLS();
      })
    })
  }

  borrarMarcador(i: number){
    this.marcadores[i].marcador?.remove();
    this.marcadores.splice(i,1);
    this.guardarMarcadoresLS()
  }
}
