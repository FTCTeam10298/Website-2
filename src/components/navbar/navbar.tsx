import { useEffect, useState } from 'react';
import './navbar.css'

const pages = [
  {name: "About", link: "/about"},
  {name: "Seasons", link: "/seasons"},
  {name: "Awards", link: "/awards"},
  {name: "Team", link: "/team"},
  {name: "Sponsors", link: "/sponsors"},    
  {name: "Donate Now!", link: "/donations"},  
]

function NavBar() { 

    const [menuDisplay, setMenuDisplay] = useState("flex");
    const [hamburgerClick, sethamburgerClick] = useState(false);
    const [windowWidth, setwindowWidth] = useState(window.innerWidth);

    const showMenu = () => {
        sethamburgerClick(true);

        setMenuDisplay((prevDisplay) => (prevDisplay === "flex" ? "none" : "flex"));
    }
    useEffect(() => {
        const initialWidth = window.innerWidth;
        console.log("Initial window size:", initialWidth);
    
        if (initialWidth >= 1201) {
          setMenuDisplay("flex"); // Menu should be visible on larger screens
        } else {
          setMenuDisplay("none"); // Menu should be hidden on smaller screens
        }
      }, []);

    useEffect(() => {
        // Handle outside clicks
        const handleDocumentClick = () => {
          if (windowWidth <= 1200) {
            if (!hamburgerClick) {
              setMenuDisplay("none");
            }
            sethamburgerClick(false);
          }
        };
    
        document.addEventListener("click", handleDocumentClick);
    
        return () => {
          document.removeEventListener("click", handleDocumentClick);
        };
      }, [hamburgerClick, windowWidth]);
    
      useEffect(() => {
        // Handle window resize
        const handleResize = () => {
          console.log("change");
          const newWidth = window.innerWidth;
          setwindowWidth(newWidth);
    
          if (newWidth >= 1201) {
            setMenuDisplay("flex");
          } else {
            setMenuDisplay("none");
          }
        };
    
        window.addEventListener("resize", handleResize);
    
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);
    

    return (
        <>
          <div className="navBar">
              <a href="/" className="left"><img src="src/components/navbar/navbar_assets/logoWebsite.svg"/></a>
              <div className="right">
                  <a id="bar" onClick={showMenu} className="bar"><img src="src/components/navbar/navbar_assets/hamburgerMenu.svg"/></a>
                  <div id="menu" className="menu" style={{display: menuDisplay}}>
                      <div className='dropdown'>
                          <a className='navItem'></a>
                      </div>
                      {pages.map((item) => (
                          <div key={item.name} >
                            <a className='navItem' href={item.link}>                          
                              {item.name}  
                            </a>
                          </div>
                      ))}
                  </div>
              </div>
              
          </div>
          <div className='announcement'>
              <p className='announcement-text'>🎉 We are going to Worlds! If you want to support our journey, please <a href='/donations'>click here!</a></p>
          </div>
        </>
    )
}

export default NavBar;