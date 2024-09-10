import { useState, useRef, useEffect } from "react";
import { FaTextHeight, FaFont, FaPalette } from "react-icons/fa";
import { ImUndo2, ImRedo2 } from "react-icons/im";
import { IoClose } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import styles from "./Canvas.module.css";
import { fontOptions } from "../data";
import { IoCreateSharp } from "react-icons/io5";

export default function CanvasApp() {
  const [texts, setTexts] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [inputText, setInputText] = useState("");
  const [fontSize, setFontSize] = useState(25);
  const [fontStyle, setFontStyle] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const canvasRef = useRef(null);
  const textInputRef = useRef();
  const ctxRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 560);
  const [isShowTextInput, setShowTextInput] = useState(false);
  const [isEditText, setEditText] = useState(false);

 
  useEffect(()=>{
    if(isShowTextInput){
      textInputRef.current.focus();
    }

  },[isShowTextInput])


  useEffect(()=>{

    if(!selectedTextIndex){
      setEditText(false);
      setInputText("");

      if(isMobile && isShowTextInput){
        setShowTextInput(false);
      }

    }

  },[selectedTextIndex])


   //====== toggle responsive text input =======//
   function toggleTextInput(){
    setShowTextInput((prev)=>!prev);
    if(isMobile && isEditText){
      setEditText(false);
    }

  }

   //===== Handle responsiveness for search bar
   const handleResize = () => {
    setIsMobile(window.innerWidth < 560);
  
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
        window.removeEventListener("resize", handleResize);
    };
}, []);


  //====== draw canvas when change in texts and selectedTextIndex ==========//
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const setCanvasSize = () => {
      const canvasContainer = canvas.parentElement;
      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientHeight;
      drawCanvas(); //--- Redraw after resizing
    };

    setCanvasSize(); //---- Initial setup
    window.addEventListener("resize", setCanvasSize); //---- Handle window resizing

    return () => window.removeEventListener("resize", setCanvasSize);
  }, [texts, selectedTextIndex]);

  const drawCanvas = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    texts.forEach((textObj, index) => {
      ctx.font = `${textObj.fontSize}px ${textObj.fontStyle}`;
      ctx.fillStyle = textObj.color;
      ctx.fillText(textObj.text, textObj.position.x, textObj.position.y);

      if (index === selectedTextIndex) {
        const textWidth = ctx.measureText(textObj.text).width;
        const textHeight = textObj.fontSize;
        ctx.strokeStyle = "#ccc"; // Use the text color as stroke color
        ctx.strokeRect(
          textObj.position.x - 2,
          textObj.position.y - textHeight,
          textWidth + 4,
          50
        );
      }
    });
  };


  //===== add text to canvas ========//
  const handleAddText = () => {
    const newText = {
      text: inputText,
      fontSize,
      fontStyle,
      color: textColor,
      position: { x: 50, y: 50 },
    };
    saveStateToUndoStack([...texts, newText]);
    setTexts((prevTexts) => [...prevTexts, newText]);
    setInputText("");

    if(isShowTextInput){
      toggleTextInput();
    }


  };

  //==== add a new states of texts and clear the redoStack ====//
  const saveStateToUndoStack = (newState) => {
    setUndoStack((prev) => [...prev, texts]);
    setRedoStack([]);   //--- Clear redo stack on new action ---//
  };

  //===== pop() the undoStack set redoStack also update the texts array ====//
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack.pop();
      setRedoStack((prev) => [...prev, texts]);
      setTexts(previousState);
      setUndoStack([...undoStack]);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setUndoStack((prev) => [...prev, texts]);
      setTexts(nextState);
      setRedoStack([...redoStack]);
    }
  };

  //====== when mouseDown inside the canvas apply dragging or text selected by conditionally =====//
  const handleMouseDown = (e) => {
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    //==== checking is clickied in the text by text position matched with mouse position ====//
    const clickedTextIndex = texts.findIndex((textObj) => {
      const ctx = ctxRef.current;
      const textWidth = ctx.measureText(textObj.text).width;
      const textHeight = textObj.fontSize;
      
      //---- comparing the position of mouse with text ----//
      return (
        mouseX >= textObj.position.x &&
        mouseX <= textObj.position.x + textWidth &&
        mouseY >= textObj.position.y - textHeight &&
        mouseY <= textObj.position.y
      );
    });

    //---- if clickIdex found then set selected text and set dragging is true ----//
    if (clickedTextIndex !== -1) {
      setSelectedTextIndex(clickedTextIndex);
      const selectedText = texts[clickedTextIndex];
      setIsDragging(true);
      setDragOffset({
        x: mouseX - selectedText.position.x,
        y: mouseY - selectedText.position.y,
      });
    } else {
      //--- removed selected text -----//
      setSelectedTextIndex(null);
    }
  };


  //======= apply X-axis nd Y-axis dynamically when text is
  //======= selected and mouseDown and mouseMove inside the  canvas 

  const handleMouseMove = (e) => {
    if (isDragging && selectedTextIndex !== null) {
      const mouseX = e.nativeEvent.offsetX;
      const mouseY = e.nativeEvent.offsetY;

      const updatedTexts = texts.map((textObj, index) =>
        index === selectedTextIndex
          ? {
              ...textObj,
              position: {
                x: mouseX - dragOffset.x,
                y: mouseY - dragOffset.y,
              },
            }
          : textObj
      );

      setTexts(updatedTexts);
    }
  };

  //====== make dragging is false when mouseUp from the text inside the canvas ====//
  const handleMouseUp = () => {
    if (isDragging) {
      saveStateToUndoStack(texts);
      setIsDragging(false);
    }
  };


  //====== apply style when text is selected ============//
  const updateSelectedTextStyle = (property, value) => {
    if (selectedTextIndex !== null) {
      const updatedTexts = texts.map((textObj, index) =>
        index === selectedTextIndex ? { ...textObj, [property]: value } : textObj
      );
      saveStateToUndoStack(updatedTexts);
      setTexts(updatedTexts);
    }
  };

  //========= function for edit text ================//
  function handleIsEditText(){
    if(selectedTextIndex !==null){
        const editableTextIndex = texts.findIndex((text, i)=>i===selectedTextIndex);
        if(editableTextIndex !== -1){
            setInputText(texts[editableTextIndex].text);
            setEditText(true);

            if(isMobile){
              setShowTextInput(true)
            }
        }
    }
  }

  function handleSubmitEditText(){

    const editText = {
      text: inputText,
      fontSize:texts[selectedTextIndex].fontSize,
      fontStyle:texts[selectedTextIndex].fontStyle,
      color: texts[selectedTextIndex].color,
      position: { x: texts[selectedTextIndex].position.x, y: texts[selectedTextIndex].position.y },
    };

    const updatdTextArray = texts.map((text, i)=>{
        if(i === selectedTextIndex){
          text={...editText}
          
        }

        return text;
    });

    saveStateToUndoStack(updatdTextArray);
    setTexts(updatdTextArray);
    setSelectedTextIndex(null);
    setEditText(false);
    setInputText("");

  }


  //======== delete a text from the canvas ====================//
  const handleDeleteText = () => {
    if (selectedTextIndex !== null) {
      const updatedTexts = texts.filter((_, index) => index !== selectedTextIndex);
      saveStateToUndoStack(updatedTexts);
      setTexts(updatedTexts);
      setSelectedTextIndex(null);
      setEditText(false);

      setInputText("");
    }
  };

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasHeaderContainer}>

       
        <ImUndo2 className={styles.undoIcons} onClick={handleUndo} />
        <ImRedo2 className={styles.redoIcons} onClick={handleRedo} />
      </div>

      <div className={styles.viewsContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        {selectedTextIndex !== null && (
          <div
            className={styles.textActionsContainer}
            style={{
              position: "absolute",
              top: texts[selectedTextIndex].position.y - 55,
              left: texts[selectedTextIndex].position.x +
                ctxRef.current.measureText(texts[selectedTextIndex].text).width - 50,
            }}
          >
            <MdEdit className={styles.editIcon} onClick={()=>handleIsEditText()} />

            <IoClose className={styles.deleteIcon} onClick={handleDeleteText} />
          </div>
        )}
      </div>

      <div className={styles.controllerContainer}>
        {!isMobile?(<>
          
          <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your text"
        />
       
        {isEditText ? (
          <button className={styles.addTextBtn}
           onClick={()=>handleSubmitEditText()} >
            Edit Text</button>
        ):(

          <button className={styles.addTextBtn} onClick={handleAddText}>
               Add Text
          </button>
        )}
        
        </>):(

         <>

        

        {!isEditText ? <button onClick={()=>isShowTextInput ? handleAddText() : toggleTextInput()} 
          className={styles.addTextBtn}>

              {isShowTextInput ? <> <IoCreateSharp />Add-Text</>:
              <> <IoCreateSharp />Text</>}
        </button> : (

          <button className={styles.addTextBtn}
                onClick={()=>handleSubmitEditText()}> 
           <IoCreateSharp />Edit-Text </button>
        )}
         
         </>
       )}

        {/* =========== show the text input fields for responsivness ======= */}

        {isShowTextInput && isMobile && 
          <div className={styles.responsiveTextInputBox}> 

            <input ref={textInputRef} type="text" value={inputText} className={styles.textInput}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text"/>

            <IoClose className={styles.closeInput} onClick={()=>toggleTextInput()} />
          
          </div>}
        


        <div className={styles.stylesControllerContainer}>
          <div className={styles.fontSizeControlDiv}>
            <FaTextHeight />
            <input
              type="number"
              value={selectedTextIndex !== null ? texts[selectedTextIndex].fontSize : fontSize}
              onChange={(e) =>
                selectedTextIndex !== null
                  ? updateSelectedTextStyle("fontSize", e.target.value)
                  : setFontSize(e.target.value)
              }
            />
          </div>

          <div className={styles.fontStyleControlDiv}>
            <FaFont />
            <select
              value={selectedTextIndex !== null ? texts[selectedTextIndex].fontStyle : fontStyle}
              onChange={(e) =>
                selectedTextIndex !== null
                  ? updateSelectedTextStyle("fontStyle", e.target.value)
                  : setFontStyle(e.target.value)
              }
            >
              {fontOptions.map((font, i) => (
                <option key={i} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fontColorControlDiv}>
            <FaPalette />
            <input
              type="color"
              value={selectedTextIndex !== null ? texts[selectedTextIndex].color : textColor}
              onChange={(e) =>
                selectedTextIndex !== null
                  ? updateSelectedTextStyle("color", e.target.value)
                  : setTextColor(e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
