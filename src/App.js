import React, { useRef, useState } from "react";
import Moveable from "react-moveable";
import { useFetchImages } from "./hook/useFetchImages";

const objectsFits = [ 'fill','contain','cover','none','scale-down' ];

const Editable = {
  name: "editable",
  props: {},
  events: {},
  render(moveable, React) {
      const rect = moveable.getRect();
      const { pos2 } = moveable.state;

      const EditableViewer = moveable.useCSS("div", `
        {
            position: absolute;
            left: 0px;
            top: 0px;
            will-change: transform;
            transform-origin: 0px 0px;
        }
        .moveable-button {
            width: 24px;
            height: 24px;
            margin-bottom: 4px;
            background: #4af;
            border-radius: 4px;
            appearance: none;
            border: 0;
            color: white;
            font-weight: bold;
        }
      `);
      return <EditableViewer key="editable-viewer" className={"moveable-editable"} style={{
          transform: `translate(${pos2[0]}px, ${pos2[1]}px) rotate(${rect.rotation}deg) translate(10px)`,
      }}>
          <button className="moveable-button" onClick={() => {
            moveable.props.onDelete( moveable.props.target.id.replace('component-','') );
           }}>x</button>
      </EditableViewer>;
  }
};

const App = () => {
  // Se crea un custom hook para recibir las imagenes
  const { images, isLoading } = useFetchImages();
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  // Resive el id en formato string para eliminar el componente
  const removeMoveable = ( id ) =>{
    setMoveableComponents([ ...moveableComponents.filter(m=>m.id !== parseInt(id) ) ])
  }

  const addMoveable = ( image ) => {
    // Create a new moveable component and add it to the array
    const { url,id } = images[ moveableComponents.length + 1 ];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: Math.floor(Math.random() * id),
        updateEnd: true,
        urlImage: url,
        objectFit: objectsFits[ Math.floor(Math.random() * objectsFits.length) ]
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {

    if(updateEnd) return;

    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main>
      <div className="center-button">
        <button className="btn-add-moveable" disabled={ isLoading } onClick={addMoveable}>Add Item</button>
      </div>
      <div
        className="container-drag"
        id="parent"
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            onDelete={removeMoveable}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  urlImage,
  objectFit,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  onDelete
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    urlImage,
    id,
    objectFit,
    onDelete
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      urlImage,
      objectFit,
      onDelete
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
      urlImage,
      objectFit,
      onDelete
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        urlImage,
        objectFit,
        onDelete
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundColor: color,
          overflow:'hidden'
        }}
        onClick={() => setSelected(id)}
      >
        <img style={{ objectFit: `${objectFit}`,height:'100%',width:'100%' }} src={ urlImage } alt="image" />
      </div>

      <Moveable
        ables={[ Editable ]}
        props={{
          editable: true
        }}
        target={isSelected && ref.current}
        resizable
        draggable
        snappable={true}
        onDelete={ onDelete }
        bounds={{ left: 0, top: 0, right: parentBounds.right - 100, bottom: parentBounds.bottom - 60 }}
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            urlImage
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
