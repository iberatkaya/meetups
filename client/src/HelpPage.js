import React from 'react';
import DateTime from 'react-datetime';
import Column from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import { MdAdd, MdRemove } from 'react-icons/md';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import 'react-datetime/css/react-datetime.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactCopy from 'copy-to-clipboard';
import Moment from 'moment';
import t from 'tcomb-form'
import { extendMoment } from 'moment-range';
import { isMobile } from 'react-device-detect';
import './Main.css';


class HelpPage extends React.Component {

    navbar = () => {
        return (
            <Navbar style={{ backgroundColor: 'rgb(240, 240, 255)' }}>
                <Navbar.Brand style={{ fontSize: 20, fontWeight: 'bold' }} >
                    <a href="/" style={{ fontSize: 20, fontWeight: 'bold', textDecoration: 'none', color: 'black' }} >
                        <img
                            alt=""
                            src={require("./logo.png")}
                            width="30"
                            height="30"
                            style={{ marginRight: 10 }}
                        />
                        MeetUps
                    </a>
                </Navbar.Brand>
                <Nav className="mr-auto" style={{ fontSize: 15 }}>
                    <Nav.Link href="/" style={{ color: '#888' }}>Home</Nav.Link>
                    <Nav.Link style={{ color: '#333', fontWeight: 'bold' }}>Help</Nav.Link>
                </Nav>
            </Navbar>
        );
    }

    render() {
        return (
            <div>
                {this.navbar()}
                <div className="Helptextcontainer">
                    <p className="Helptext">Welcome to MeetUps. MeetUps is a group meetup organizer. Select your available dates and times, and create or join a room. Once you create a room, you can send the link to your friends to let them join your room. MeetUps will then show you the available time slots for your next meetup!</p>
                    <p className="Helptext">Feel free to download the <a target="_blank" href="https://play.google.com/store/apps/details?id=com.kaya.meetupapp">Android App</a> for a better experience. The iOS App is currently under development.</p>
                </div>
                <a
                    target="_blank"
                    href="https://play.google.com/store/apps/details?id=com.kaya.meetupapp"
                    style={{ position: 'fixed', zindex: 100, bottom: 0, right: 0, width: isMobile ? 100 : 150, height: isMobile ? 38 : 58 }}>
                    <Image
                        fluid
                        src={require('./playstore.png')}
                    />
                </a>
            </div>
        );
    }
}

export default HelpPage;
