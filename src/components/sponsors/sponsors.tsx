import './sponsors.css'

const sponsors = [
    { name: "FathomWerx", url: "https://www.fathomwerx.com/", img: "fathomwerx.png" },
    { name: "FirstMile", url: "https://www.firstmile.com/", img: "firstmile.png" },
    { name: "Gene Haas Foundation", url: "https://www.haascnc.com/content/ghf/en/home.html", img: "genehaas.png" },
    { name: "Holler", img: "hollerLogo.png", dark: true },
    { name: "Marvell", url: "https://www.marvell.com/", img: "marvell.png" },
    { name: "Porter & Associates", url: "http://portercivil.com/HOME.html", img: "PA.png" },
    { name: "Thousand Oaks Presbyterian Church", url: "https://www.topresbyterian.com/", img: "TOPC.png" },
    { name: "Matter Labs", url: "https://www.matterlabs.co/", img: "matterLabs.png" },
    { name: "Horizon", img: "horizon.png" },
    { name: "Sisson Properties", img: "sisson.png" },
];

function Sponsors() {
    return (
        <div className="content">
            <h2 className='title toppage'>Thank You To All of Our Sponsors!</h2>
            <div className='sponsor-img'>
                {sponsors.map((sponsor) => (
                    <a
                        key={sponsor.name}
                        className={sponsor.dark ? 'sponsor-tile bg' : 'sponsor-tile'}
                        href={sponsor.url}
                        target={sponsor.url ? '_blank' : undefined}
                        rel={sponsor.url ? 'noopener noreferrer' : undefined}
                    >
                        <img src={`/sponsor_assets/${sponsor.img}`} alt={sponsor.name} />
                        <span className='sponsor-name'>{sponsor.name}</span>
                    </a>
                ))}
            </div>

        </div>
    )
}

export default Sponsors;