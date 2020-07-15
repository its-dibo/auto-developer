//dynamically load a component into the template
import {
  Injectable,
  ComponentFactoryResolver,
  Renderer2,
  RendererFactory2
} from "@angular/core";

@Injectable()
export class DynamicLoadService {
  renderer: Renderer2;
  constructor(
    private resolver: ComponentFactoryResolver,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null); //fix: No provider for Renderer2   https://stackoverflow.com/a/47925259
  }

  /**
   * dynamically load Angular components
   * @method load
   * @param  component [description]
   * @param  ref       reference to the container where the dynamically loaded component will be injected
   * @param  inputs      pass inputs to the component
   * @param fn
   * @return [description]
   */

  /*
  notes:
    - placeholder:
       <ng-template #placeholder></ng-template>  OR <ng-template dynamic-load-directive></>
       @ViewChild('placeholder', {read: ViewContainerRef, static: true}) placeholder: ViewContainerRef;
   */

  load(component, placeholder, inputs) {
    placeholder.clear();

    //todo: provide text or renderer methods
    let content = this.renderer.createText("");

    // resolve the component component and get the factory class to create the component dynamically
    let factory = this.resolver.resolveComponentFactory(component);

    // create the component and append to the placeholder in the template
    let componentRef = placeholder.createComponent(factory);

    if (inputs) {
      let comp = componentRef.instance; //todo: <ComponentType>componentRef.instance
      for (let k in inputs) {
        comp[k] = inputs[k]; //or: Object.assign(..)
      }
    }

    let el = componentRef.location.nativeElement as HTMLElement;
    el.appendChild(content); //or: return el
  }
}
