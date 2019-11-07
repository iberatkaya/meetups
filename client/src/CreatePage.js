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

const moment = extendMoment(Moment);
const Form = t.form.Form;

const FormSchema = t.struct({
    name: t.String,         // a required string
})

const FormSchemaRoom = t.struct({
    room: t.String,         // a required string
})

class CreatePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                user:
                {
                    dates: [
                        {
                            startDate: this.roundDate(new Date()),
                            endDate: this.roundDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60))
                        }
                    ],
                    id: 0
                }

            },
            intersections: [],
            value: '',
            valueroom: '',
            response: {},
            sent: false,
            key: ''
        }
    }

    timeChange = (date, index, type) => {
        let data = this.state.data;
        let objarr = data.user.dates;
        console.log(objarr);
        if (type === 'end') {
            if (objarr[index].startDate.getTime() >= date.getTime()) {
                alert('End Date cannot be smaller than Start Date');
                return;
            }
        }
        if (type === 'start') {
            objarr[index].startDate = date;
            objarr[index].endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, date.getMinutes());
        }
        else if (type === 'end') {
            if (objarr[index].startDate.getTime() >= date.getTime()) {
                alert('End Date cannot be smaller than Start Date');
                return;
            }
            objarr[index].endDate = date;
        }
        data.user.dates = objarr;
        this.setState({ data: data });
    }

    roundDate = (date) => {
        let coeff = 1000 * 60 * 15;     //15 is the round time parameter
        let rounded = new Date(Math.round(date.getTime() / coeff) * coeff)
        return rounded;
    }

    dateLists = (items) => {
        let dateCardClass = "Datecard"
        return (
            items.map((item, index) => {
                if (index === items.length - 1)
                    dateCardClass = "Datecard"
                else
                    dateCardClass = "Datecard Bottomborder"
                return (
                    <Column>
                        {
                            isMobile
                                ?
                                <Column className={dateCardClass}>
                                    <Column className="Datecardcol">
                                        <p className="Datetext">Start Date</p>
                                        <div style={{ marginTop: 4 }}>
                                            <DateTime
                                                timeConstraints={{
                                                    minutes: {
                                                        step: 15
                                                    }
                                                }}
                                                inputProps={{ readOnly: true }}
                                                value={item.startDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'start'); }}
                                            />
                                        </div>
                                    </Column>
                                    <Column className="Datecardcol">
                                        <p className="Datetext">End Date</p>
                                        <div style={{ marginTop: 4 }}>
                                            <DateTime
                                                timeConstraints={{
                                                    minutes: {
                                                        step: 15
                                                    }
                                                }}
                                                inputProps={{ readOnly: true }}
                                                value={item.endDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'end'); }}
                                            />
                                        </div>
                                    </Column>
                                </Column>

                                :
                                <Row className={dateCardClass}>
                                    <Row className="Datecardrow">
                                        <p className="Datetext">Start Date:</p>
                                        <div>
                                            <DateTime
                                                timeConstraints={{
                                                    minutes: {
                                                        step: 15
                                                    }
                                                }}
                                                inputProps={{ readOnly: true }}
                                                value={item.startDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'start'); }}
                                            />
                                        </div>
                                    </Row>
                                    <Row className="Datecardrow">
                                        <p className="Datetext">End Date: </p>
                                        <div>
                                            <DateTime
                                                timeConstraints={{
                                                    minutes: {
                                                        step: 15
                                                    }
                                                }}
                                                inputProps={{ readOnly: true }}
                                                value={item.endDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'end'); }}
                                            />
                                        </div>
                                    </Row>
                                </Row>
                        }
                    </Column>
                )
            })
        );
    }


    options = {
        fields: {
            name: {
                label: ' ',
                error: 'Please enter a name.',
                attrs: {
                    placeholder: 'Name',
                    autoComplete: 'off'
                }
            }
        }
    }

    optionsroom = {
        fields: {
            room: {
                label: ' ',
                error: 'Please enter a room title.',
                attrs: {
                    placeholder: 'Room Title',
                    autoComplete: 'off'
                }
            }
        }
    }

    form = () => {
        return (
            <Container style={isMobile ? { width: '98%' } : { width: '30%' }} className="Form" >
                <Form
                    value={this.state.value}
                    onChange={(val) => { this.setState({ value: val }); }}
                    ref="form"
                    options={this.options}
                    type={FormSchema} />
                <div className="form-group">
                    <Button
                        style={{ marginLeft: 'auto', marginRight: 'auto' }}
                        onClick={async () => {
                            const value = this.refs.form.getValue();
                            const valueroom = this.refs.formroom.getValue();
                            console.log(valueroom);
                            if (value != null && valueroom != null) {
                                let name = value.name;
                                let res = await fetch('/api', {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    method: 'POST',
                                    body: JSON.stringify({ name: name, dates: this.state.data.user.dates, roomtitle: valueroom.room })
                                });
                                let resjson = await res.json();
                                this.setState({ response: resjson, key: resjson.key }, () => {
                                    //                                    ReactCopy('https://ibkmeetup.herokuapp.com/' + resjson.key)
                                    this.props.history.push('/' + resjson.key);
                                })
                            }
                        }} type="submit">Create Room</Button>
                </div>
            </Container>
        )
    }

    renderUser = () => {
        let items = [this.state.data.user];
        return items.map((item, index) => {
            return (
                <Column className="Usercard" style={{ paddingTop: 16 }}>
                    <p className="Availabledate">Select your available dates:</p>
                    {this.dateLists(item.dates)}
                    <Row className="justify-content-center">
                        {this.state.data.user.dates.length !== 1 ?
                            <MdRemove
                                style={{ color: '#222', fontSize: 24 }}
                                onClick={() => {
                                    let data = this.state.data;
                                    let dates = data.user.dates;
                                    dates.pop();
                                    data.user.dates = dates;
                                    this.setState({ data: data });
                                }} /> : <div></div>}
                        <MdAdd
                            style={{ color: '#ff4444', fontSize: 30 }}
                            onClick={() => {
                                let data = this.state.data;
                                let dates = item.dates;
                                let max = 0;
                                let datelen = dates.length;
                                for (let j = 0; j < datelen; j++) {
                                    if (j === 0) {
                                        max = dates[j].endDate.getTime();
                                        continue;
                                    }
                                    if (max < dates[j].endDate.getTime())
                                        max = dates[j].endDate.getTime();
                                }
                                /*for(let a=0; a<dates.length; a++){
                                  if(date >= dates[a].startDate && date <= dates[a].endDate){
                                    while((date >= dates[a].startDate && date <= dates[a].endDate)){
                                      date = date + 1860000;
                                    }
                                  }
                                }*/
                                let date = max;
                                dates.push({
                                    startDate: new Date(date + 900000),
                                    endDate: new Date(date + 4500000)
                                });
                                data.user.dates = dates;
                                this.setState({ data: data });
                            }} />
                    </Row>
                    {this.form()}
                </Column>
            )
        });
    }


    navbar = () => {
        return (
            <Navbar style={{ backgroundColor: 'rgb(240, 240, 255)' }}>
                <Navbar.Brand style={{ fontSize: 24 }} >
                    <img
                        alt=""
                        src={require("./logo.png")}
                        width="30"
                        height="30"
                        style={{ marginRight: 6 }}
                    />
                    MeetUp
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link style={{ color: '#333', fontWeight: 'bold' }}>Home</Nav.Link>
                    {/*<Nav.Link href="#features">Features</Nav.Link>
                    <Nav.Link href="#pricing">Pricing</Nav.Link>*/}
                </Nav>
            </Navbar>
        );
    }

    render() {
        return (
            <div>
                {this.navbar()}
                <Column>
                    <div>
                        <Container style={isMobile ? { width: '98%' } : { width: '30%' }} className="Form" >
                            <Form
                                value={this.state.valueroom}
                                onChange={(valroom) => { this.setState({ valueroom: valroom }); }}
                                ref="formroom"
                                options={this.optionsroom}
                                type={FormSchemaRoom} />
                        </Container>
                    </div>
                    {this.renderUser()}
                </Column>
                <a 
                    target="_blank"
                    href="https://play.google.com/store/apps/details?id=com.kaya.meetupapp"
                    style={{position: 'fixed',  bottom: 0, right: 0, width: isMobile ? 100 : 150, height: isMobile ? 38 : 58}}>
                    <Image
                        fluid
                        src={require('./playstore.png')}
                    />
                </a>
            </div>
        );
    }
}

export default CreatePage;
