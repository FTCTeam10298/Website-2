import { useEffect, useState } from 'react';
import './navbar.css'

// Import the seasons list from your Seasons component or create a shared file
const seasonsList = [
    { name: "2024-2025 Into the Deep"},
    { name: "2023-2024 Centerstage"},
    { name: "2022-2023 Power Play" },
    { name: "2021-2022 Freight Frenzy"},
    { name: "2018-2019 Rover Ruckus"},
    { name: "2017-2018 Relic Recovery"},
    { name: "2016-2017 Velocity Vortex" },
    { name: "2015-2016 Res-Q"},
];

const pages = [
  {name: "About", link: "/about"},
  {
    name: "Seasons", 
    link: "/seasons",
    isDropdown: true,
    dropdownItems: seasonsList.map(season => ({
      name: season.name,
      link: `/seasons?season=${encodeURIComponent(season.name)}`
    }))
  },
  {name: "Awards", link: "/awards"},
  {name: "Team", link: "/team"},
  {name: "Sponsors", link: "/sponsors"},    
  {name: "Donate Now!", link: "/donations"},  
]

function NavBar() { 
    // Rest of your NavBar component remains the same
      // Rest of your NavBar component remains the same
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
                <a href="/" className="left"><img src="/navbar_assets/logoWebsite.svg" alt="Logo"/></a>
                <div className="right">
                    <a id="bar" onClick={showMenu} className="bar"><img src="/navbar_assets/hamburgerMenu.svg" alt="Menu"/></a>
                    <div id="menu" className="menu" style={{display: menuDisplay}}>
                        {pages.map((item) => (
                            <div key={item.name} className={item.isDropdown ? 'dropdown' : ''}>
                              <a className='navItem' href={item.link}>                          
                                {item.name}  
                              </a>
                              {item.isDropdown && item.dropdownItems && (
                                <div className="dropdown-content">
                                  {item.dropdownItems.map(dropdownItem => (
                                    <a key={dropdownItem.name} href={dropdownItem.link}>
                                      {dropdownItem.name}
                                    </a>
                                  ))}
                                </div>
                              )}
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
    
    // ...
    
    return (
        <>
          <div className="navBar">
              <a href="/" className="left"><img src="/navbar_assets/logoWebsite.svg" alt="Logo"/></a>
              <div className="right">
                  <a id="bar" onClick={showMenu} className="bar"><img src="/navbar_assets/hamburgerMenu.svg" alt="Menu"/></a>
                  <div id="menu" className="menu" style={{display: menuDisplay}}>
                      {pages.map((item) => (
                          <div key={item.name} className={item.isDropdown ? 'dropdown' : ''}>
                            <a className='navItem' href={item.link}>                          
                              {item.name}  
                            </a>
                            {item.isDropdown && item.dropdownItems && (
                              <div className="dropdown-content">
                                {item.dropdownItems.map(dropdownItem => (
                                  <a key={dropdownItem.name} href={dropdownItem.link}>
                                    {dropdownItem.name}
                                  </a>
                                ))}
                              </div>
                            )}
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


