import './footer.css'

function Footer() {
    return (
        <div className="footer">
            <ul className="copyright">
                <li className="border">&copy; Brain Stormz. All rights reserved.</li>

                <li><a className="border" href="https://github.com/FTCTeam10298" target="_blank">Github</a></li>
                <li><a className="border" href="https://ftcscout.org/teams/10298" target="_blank">FTCScout</a></li>
                
                <li className="icon"><a href="https://www.youtube.com/channel/UCpSItH8a8vWw5IcwylQ21Xg" target="_blank"><img src="/footer_assets/icon-youtube.svg"/></a></li>
                <li className="icon"><a href="https://twitter.com/ftc10298?lang=en" target="_blank"><img src="/footer_assets/icon-twitter.svg"/></a></li>
                <li className="icon"><a href="https://www.facebook.com/ftc10298brainstormz/" target="_blank"><img src="/footer_assets/icon-facebook.svg"/></a></li>
                <li className="icon"><a href="https://www.instagram.com/brain_stormz/" target="_blank"><img src="/footer_assets/icon-instagram.svg"/></a></li>
            </ul>
        </div>
    );
}

export default Footer;