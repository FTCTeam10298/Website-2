
function Contact() {

    return (
        <div className='content'>
            <h2 className='title toppage'>Contact Us</h2>
            <p>
                For inquiries, please email us at <a href="mailto:ftc10298@gmail.com ">ftc10298@gmail.com </a>
            </p>
            <img style={
                {
                    marginTop: "20px",
                    borderRadius: "10px",
                    maxWidth: "50%",
                    height: "auto",
                }
            }src="/contact_assets/tem.jpeg" alt="Contact Us Illustration" className="contact-image"/>
            
        </div>
    )
}

export default Contact;