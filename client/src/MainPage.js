import React from 'react';
import DateTime from 'react-datetime';
import Column from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { MdAdd, MdRemove } from 'react-icons/md';
import 'react-datetime/css/react-datetime.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactCopy from 'copy-to-clipboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Moment from 'moment';
import t from 'tcomb-form'
import { extendMoment } from 'moment-range';
import './Main.css';
import { isMobile } from 'react-device-detect';

const moment = extendMoment(Moment);
const Form = t.form.Form;

const FormSchema = t.struct({
    name: t.String,         // a required string
})

class MainPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                persons: [
                ],
                user:
                {
                    dates: [
                        {
                            startDate: this.roundDate(new Date()),
                            endDate: this.roundDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60))
                        }
                    ],
                    id: 0
                },
            },
            key: this.props.match.params.key,
            roomTitle: '',
            intersections: [],
            value: '',
            error: false,
            joinRoom: false,
            sentData: false
        }
    }


    roundDate = (date) => {
        let coeff = 1000 * 60 * 15;     //15 is the round time parameter
        let rounded = new Date(Math.round(date.getTime() / coeff) * coeff)
        return rounded;
    }

    errorScreen = () => {
        return (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
                <p style={{ fontSize: 24 }}>Sorry, empty room :(</p>
            </div>
        )
    }

    fetchPeople = async () => {
        let res = await fetch('/api/' + this.state.key, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'GET',
        });
        let resjson = await res.json();
        if (resjson.length === 0) {
            this.setState({ error: true });
            return;
        }
        let persons = [];
        for (let i = 0; i < resjson.length; i++) {
            let dates = JSON.parse(resjson[i].dates);
            let newdates = []
            for (let j = 0; j < dates.length; j++) {
                newdates.push({ startDate: new Date(dates[j].startDate), endDate: new Date(dates[j].endDate) });
            }
            persons.push({ dates: newdates, id: i, name: resjson[i].name });
        }
        console.log(resjson);
        let roomTitle = resjson[0].roomtitle;
        let data = { ...this.state.data };
        data.persons = persons;
        this.setState({ data: data, roomTitle: roomTitle }, () => {
            console.log(this.state.roomTitle);
            this.calculateAvailableTime();
        });
    }

    async componentDidMount() {
        await this.fetchPeople(true);
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
        console.log(data.user.dates);
        this.setState({ data: data }, () => {
            this.calculateAvailableTime();
        });
    }


    dateLists = (items, type) => {
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
                                                inputProps={type === 'person' ? { disabled: true } : { readOnly: true }}
                                                value={item.startDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => {
                                                    this.timeChange(date.toDate(), index, 'start');
                                                }}
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
                                                inputProps={type === 'person' ? { disabled: true } : { readOnly: true }}
                                                value={item.endDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => {
                                                    this.timeChange(date.toDate(), index, 'end');
                                                }}
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
                                                inputProps={type === 'person' ? { disabled: true } : { readOnly: true }}
                                                value={item.startDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => {
                                                    this.timeChange(date.toDate(), index, 'start');
                                                }}
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
                                                inputProps={type === 'person' ? { disabled: true } : { readOnly: true }}
                                                value={item.endDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMM DD, YYYY"
                                                onChange={(date) => {
                                                    this.timeChange(date.toDate(), index, 'end');
                                                }}
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


    renderPeople = () => {
        let items = this.state.data.persons;
        return items.map((item, index) => {
            return (
                <Column className="Card">
                    <p className="Username" >{item.name}</p>
                    <p className="Availabledate">Available dates:</p>
                    {this.dateLists(item.dates, 'person')}
                </Column>
            )
        })
    }

    renderUser = () => {
        let items = [this.state.data.user];
        return items.map((item, index) => {
            return (
                <Column className="Usercard" style={{ paddingTop: 16, marginTop: 6 }}>
                    <p className="Availabledate">Select your available dates:</p>
                    {this.dateLists(item.dates, 'user')}
                    <Row className="justify-content-center">
                        {this.state.data.user.dates.length !== 1 ?
                            <MdRemove
                                style={{ color: '#222', fontSize: 24 }}
                                onClick={() => {
                                    let data = this.state.data;
                                    let dates = data.user.dates;
                                    dates.pop();
                                    data.user.dates = dates;
                                    this.setState({ data: data },
                                        () => { this.calculateAvailableTime() });
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
                                this.setState({ data: data }, () => {
                                    this.calculateAvailableTime();
                                });
                            }} />
                    </Row>
                    {this.form()}
                </Column>
            )
        });
    }

    calculateAvailableTime = () => {
        let persons = this.state.data.persons;
        let ranges = [];
        let min = 0;
        let max = 0;
        let perlen = persons.length;
        for (let i = 0; i < perlen; i++) {
            let date = persons[i].dates;
            let datelen = persons[i].dates.length;
            for (let j = 0; j < datelen; j++) {
                if (i === 0 && j === 0) {
                    min = date[j].startDate.getTime();
                    max = date[j].endDate.getTime();
                    continue;
                }
                if (min > date[j].startDate.getTime())
                    min = date[j].startDate.getTime();
                if (max < date[j].endDate.getTime())
                    max = date[j].endDate.getTime();
            }
        }
        let range = { start: min, end: max };
        let stepdiv = persons.length * 10000;
        let step = (max - min) / stepdiv;
        for (let a = range.start; a < range.end; a += step) {
            ranges.push({ start: a, end: a + step, occurance: 0, personid: [] });
        }
        for (let a = 0; a < ranges.length; a++) {
            let perlen = persons.length;
            for (let b = 0; b < perlen; b++) {
                let dates = persons[b].dates;
                let datelen = persons[b].dates.length;
                for (let c = 0; c < datelen; c++) {
                    if (ranges[a].start >= dates[c].startDate.getTime() && ranges[a].end <= dates[c].endDate.getTime()) {
                        ranges[a].occurance++;
                        ranges[a].personid.push(persons[b].id);
                    }
                }
            }
        }
        /*
        console.log(ranges.map((a) => {
          return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm')})
        }));
        console.log(this.normalize(ranges).map((a) => {
          return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm'), occurance: a.occurance})
        }));*/
        let normalizedranges = this.normalize(ranges, min, max);
        /*console.log([normalizedranges[normalizedranges.length-1]].map((a) => {
            return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm'), occurance: a.occurance})
          }));*/
        this.setState({ intersections: normalizedranges });
    }

    normalize = (array, min, max) => {
        let len = array.length;
        let newarr = [];
        for (let a = 0; a < len - 1; a++) {
            let firstel = array[a];
            let b = a + 1;
            let newel = { ...firstel };
            while (b < len && firstel.occurance === array[b].occurance) {    //If different persons are wanted, check the personid's
                newel.end = array[b].end;
                b++;
                a++;
                if (a > len) {
                    console.log('error');
                    return [];
                }
            }
            /* console.log((max - min) / 10 +  ' < ' + (newel.end - newel.start))
             console.log((max - min) / 10 < (newel.end - newel.start))*/
            if (newel.occurance > 1 /*&& (max - min) / 10 < (newel.end - newel.start)*/) {
                newarr.push(newel);
            }
        }
        for (let i = 0; i < newarr.length; i++) {
            for (let j = 0; j < newarr[i].personid.length - 1; j++) {
                let person1 = newarr[i].personid[j];
                for (let k = j + 1; k < newarr[i].personid.length; k++) {
                    let person2 = newarr[i].personid[k];
                    if (person1 === person2)
                        newarr[i].occurance--;
                }
            }
        }
        let finalarray = [];
        for (let i = 0; i < newarr.length; i++) {
            if (newarr[i].occurance > 1)
                finalarray.push(newarr[i]);
        }
        return finalarray;
    }

    intersectionsList = () => {
        let intersections = this.state.intersections;
        return intersections.map((item, index) => {
            //    console.log(new Date(item.start));
            //    console.log(new Date(item.end));
            return (
                <Column>
                    <p className="Intersectiontext"><b>{item.occurance}</b> people are available at {moment(this.roundDate(new Date(item.start))).format('MMM DD, YYYY HH:mm')} - {moment(this.roundDate(new Date(item.end))).format('MMM DD, YYYY HH:mm')}</p>
                </Column>
            )
        });
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

    form = () => {
        return (
            <div style={isMobile ? { width: '98%' } : { width: '30%' }} className="Form" >
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
                            if (value === null) {
                                return;
                            }
                            if (value.name !== null && value.name !== undefined && value.name !== '') {
                                let name = value.name;
                                let res = await fetch('/api/' + this.state.key, {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    method: 'POST',
                                    body: JSON.stringify({ name: name, dates: this.state.data.user.dates, roomtitle: this.state.roomTitle })
                                });
                                let resjson = await res.json();
                                console.log(resjson);
                                if (resjson !== null) {
                                    if (resjson.success === '1') {
                                        ReactCopy('https://ibkmeetup.herokuapp.com/' + this.state.key);
                                        toast.info('Copied to clipboard');
                                        let data = { ...this.state.data };
                                        data.people = [];
                                        this.setState({ sent: true, data: data }, async () => {
                                            await this.fetchPeople(false);
                                        });
                                    }
                                }
                            }
                        }} type="submit">Join Room</Button>
                </div>
            </div>
        )
    }

    joinRoom = () => {
        return (
            <div
                className="Usercard" style={{ paddingTop: 16, marginTop: 6, textAlign: 'center' }}
            >
                <Button
                    className="Joinroombutton"
                    onClick={() => {
                        this.setState({ joinRoom: true })
                    }}
                >
                    Join Room
            </Button>
            </div>
        );
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
                    <Nav.Link href="/">Home</Nav.Link>
                    {
                        this.state.error ?
                            <div></div>
                            :
                            <Nav.Link onClick={() => {
                                ReactCopy('https://ibkmeetup.herokuapp.com/' + this.state.key);
                                toast.info('Copied to clipboard');
                            }}>Copy Link</Nav.Link>
                    }
                    {/*<Nav.Link href="#features">Features</Nav.Link>
                        <Nav.Link href="#pricing">Pricing</Nav.Link>*/}
                </Nav>
            </Navbar>
        );
    }

    render() {
        console.log(this.state.roomTitle);
        return (
            <div>
                {this.navbar()}
                {
                    this.state.error ?
                        this.errorScreen()
                        :
                        <div>
                            <div className="justify-content-center" style={{ marginTop: 8 }}>
                                <div className="Peopleinroom">
                                    <p className="Roomtitle">{this.state.roomTitle}</p>
                                    <p className="Peopleinroomtext">People in the room: {this.state.data.persons.length}</p>
                                </div>
                                <Column>
                                    {
                                        this.state.sent ?
                                            <div></div>
                                            :
                                            <div>
                                                {!this.state.joinRoom ?
                                                    this.joinRoom()
                                                    :
                                                    this.renderUser()
                                                }
                                            </div>
                                    }
                                    {
                                        this.state.intersections.length > 0
                                            ?
                                            <div className="Intersectionlist">
                                                <p className="Intersectionhelptext">Intersections:</p>
                                                {this.intersectionsList()}
                                            </div>
                                            :
                                            <div></div>
                                    }
                                    {this.renderPeople()}
                                    <ToastContainer position="bottom-right" />
                                </Column>
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default MainPage;
