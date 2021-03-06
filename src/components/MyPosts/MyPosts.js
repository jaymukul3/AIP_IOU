import React from 'react';
import { Popover, Button, Modal, message } from 'antd';
import './MyPosts.css';
import { UserOutlined, UsergroupAddOutlined, CalendarOutlined } from '@ant-design/icons'
import AddRewards from "../AddRewards/Index";
import axios from 'axios';
import cookie from 'react-cookies';
import CompletePost from '../CompletePost/CompletePost';



class MyPosts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // UI states
            login: false,
            displayButton: false,
            addRewardsVisible: false,
            uploadVisible: false,
            displayBodyRight: "none",
            displayAddRewardButton: "none",

            // Function states
            allPosts: [],
            particularPost_Post: [{
                "post_id": "",
                "added_by": "",
                "offer_by": "",
                "title": "",
                "description": "",
                "added_datetime": "",
                "status": "",
                "proof": false
            }],
            particularPost_Rewards: [],
            particularPost_Poster: "",
            particularPost_Signer: "",
            particularPost_adders: [],
            RewardsEnumnation: [],

        }
    }
    // Timer for refresh the post list
    timerStart = () => {

        setInterval(() => {
            let userID = cookie.load("user_id");
            let responseData = [];
            axios.get(`https://aip-v1.ts.r.appspot.com/api/posts?user_id=${userID}`)
                .then(response => {
                    // receive response Data
                    responseData = response.data.post;

                    // Parse Data into local states
                    this.setState({
                        allPosts: responseData
                    })
                })
                .catch((e) => {
                    console.log(e)
                })
        }, 2000);
    }

    componentDidMount() {

        // get login status from cookie
        if (cookie.load("user_id")) {
            this.setState({
                displayButton: "block"
            });
            let userID = cookie.load("user_id");
            // get all posts related to the logged in user(with user_id parameter)
            let responseData = [];
            setTimeout(() => {
                axios.get(`https://aip-v1.ts.r.appspot.com/api/posts?user_id=${userID}`)
                    .then(response => {
                        if (response.status === 200) {
                            message
                                .loading('Loading.....', 0.5);
                            // receive response Data
                            responseData = response.data.post;

                            // Parse Data into local states
                            this.setState({
                                allPosts: responseData
                            })
                            if (responseData !== []) {
                                this.timerStart();
                            }
                        }

                    })
                    .catch((e) => {
                        console.log(e)
                    })
            }, 1000);
        } else {
            this.setState({
                displayButton: "none"
            });
        }

        // get the reward enumation
        let rewards = [];
        axios.get('https://aip-v1.ts.r.appspot.com/api/rewards')
            .then(response => {
                rewards = response.data;
            })
            .catch((e) => {
                console.log(e)
            })
        this.setState({
            RewardsEnumnation: rewards
        });
    }
    // When user click a particular Post in the left list, fetch the details and display on the right
    handleItemSelect(item) {
        let particularPost_Post;
        let particularPost_Rewards;
        let selectedPostID = item.post_id;
        // retrieve the selected Post data      
        axios.get(`https://aip-v1.ts.r.appspot.com/api/posts/${selectedPostID}`)
            .then(response => {
                particularPost_Post = response.data.post;
                particularPost_Rewards = response.data.rewards;
                // parse data into local states
                this.setState({
                    particularPost_Post: particularPost_Post,
                    particularPost_Rewards: particularPost_Rewards
                });

                // UI logic: decide which button to show in the detail page
                this.setState({
                    displayAddRewardButton: "none",
                });
                if (this.state.particularPost_Post[0].status === "Open") {
                    this.setState({
                        displayAddRewardButton: "block"
                    });
                }
            })

            .then(() => {
                // find the post user name
                let posterName;
                let posterID = this.state.particularPost_Post[0].added_by;
                axios.get(`https://aip-v1.ts.r.appspot.com/api/users/${posterID}`)
                    .then(response => {
                        posterName = response.data.users[0].first_name
                            + " " + response.data.users[0].last_name;
                        this.setState({
                            particularPost_Poster: posterName
                        })
                    })
                    .catch((e) => {
                        console.log(e)
                    })
            })
            .then(() => {
                // find people who add rewards 
                // clear old particularPost_adders
                this.setState({
                    particularPost_adders: []
                });
                let rewards = this.state.particularPost_Rewards
                // Parse and store all users who have added rewards and the certain count of their rewards
                rewards.forEach(item => {
                    let adderID = item.user_id;
                    let adderRewards = item.rewards;
                    axios.get(`https://aip-v1.ts.r.appspot.com/api/users/${adderID}`)
                        .then(response => {
                            let adderName = response.data.users[0].first_name
                                + " " + response.data.users[0].last_name;
                            let particularPost_adders = this.state.particularPost_adders;
                            this.setState({
                                particularPost_adders: particularPost_adders.concat({
                                    "name": adderName,
                                    "rewards": adderRewards
                                })
                            })
                        })
                        .catch((e) => {
                            console.log(e)
                        })
                });
            })
            // find the man who signed this 
            .then(() => {
                this.setState({
                    particularPost_Signer: ""
                });
                let signerID = this.state.particularPost_Post[0].offer_by
                if (signerID) {
                    axios.get(`https://aip-v1.ts.r.appspot.com/api/users/${signerID}`)
                        .then(response => {
                            let signerName = response.data.users[0].first_name
                                + " " + response.data.users[0].last_name;
                            this.setState({
                                particularPost_Signer: signerName
                            })
                        })
                        .catch((e) => {
                            console.log(e)
                        })
                }
            })
            // no error occurs, then display the detail page frame
            .then(() => {
                this.setState({
                    displayBodyRight: "block"
                })
            })
            .catch((e) => {
                console.log(e)
            })

    }
    // UI logic
    showAddRewardsModal() {
        this.setState({
            addRewardsVisible: true
        });
    }
    // UI logic
    handleCancel() {
        this.setState({
            addRewardsVisible: false,
            uploadVisible: false
        });
        window.location.reload();
    }
    // When user click make an offer button, means he wants to do this job, call this function to send request to API
    handleSignAPost() {
        // prepare data in request body
        let post_id = this.state.particularPost_Post[0].post_id;
        let user_id = cookie.load("user_id");
        let data = {
            "post_id": post_id,
            "user_id": user_id,
            "proof": 0
        }
        axios.put("https://aip-v1.ts.r.appspot.com/api/posts/apply_rewards", data)
            .then(response => {
                let resMessage = response.data.message;
                message.success(resMessage);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            })
            .catch((e) => {
                console.log(e)
            })
    }
    // UI logic
    showUploadModal() {
        this.setState({
            uploadVisible: true
        });
    }

    render() {
        let self = this;
        let popContent = [];
        let popContentIndex = 0;
        return (
            <div classNam="requestList">
                <div className="requestList-body">
                    <div className="requestList-body-left">
                        {this.state.allPosts.map(function (item) {
                            switch (item.status) {
                                case "Open":
                                    return (
                                        <div
                                            className="requestList-item"
                                            onClick={self.handleItemSelect.bind(self, item)}>
                                            <div className="requestList-item-header">{item.title}</div>
                                            <div className="requestList-item-body">
                                                <ul>
                                                    <li><UserOutlined />Poster:{item.username}</li>
                                                    <li><CalendarOutlined />Post Date:{item.added_datetime.split("T")[0]}</li>
                                                </ul>
                                            </div>
                                            <div className="requestList-item-status-open">{item.status}</div>
                                        </div>
                                    )
                                case "Closed":
                                    return (
                                        <div
                                            className="requestList-item"
                                            onClick={self.handleItemSelect.bind(self, item)}>
                                            <div className="requestList-item-header">{item.title}</div>
                                            <div className="requestList-item-body">
                                                <ul>
                                                    <li><UserOutlined />Poster:{item.username}</li>
                                                    <li><CalendarOutlined />Post Date:{item.added_datetime.split("T")[0]}</li>
                                                </ul>
                                            </div>
                                            <div className="requestList-item-status-closed">{item.status}</div>
                                        </div>
                                    )

                                case "Assigned":
                                    return (
                                        <div
                                            className="requestList-item"
                                            onClick={self.handleItemSelect.bind(self, item)}>
                                            <div className="requestList-item-header">{item.title}</div>
                                            <div className="requestList-item-body">
                                                <ul>
                                                    <li><UserOutlined />Poster:{item.username}</li>
                                                    <li><CalendarOutlined />Post Date:{item.added_datetime.split("T")[0]}</li>
                                                </ul>
                                            </div>
                                            <div className="requestList-item-status-assigned">{item.status}</div>
                                        </div>
                                    )


                            }
                        })}
                    </div>
                    <div className="requestList-body-right" style={{ display: this.state.displayBodyRight }}>
                        <div className="requestList-body-right-header">
                            {this.state.particularPost_Post[0].title}
                        </div>
                        <div className="requestList-body-right-body">
                            <div>
                                <span><UserOutlined />Posted BY:</span>
                                <span className="requestList-body-right-body-favoricon">{this.state.particularPost_Poster}</span>
                            </div>
                            <div>
                                <span>Status:</span>
                                <span>{this.state.particularPost_Post[0].status}</span>
                            </div>
                            <div>
                                <span><UsergroupAddOutlined />Rewards:</span>
                                {this.state.particularPost_adders.map(function (item) {
                                    popContent = popContent.concat(
                                        <div>
                                            {item.rewards.map(function (element) {
                                                return (
                                                    <p>{element.qty}      {element.reward_name} </p>
                                                )
                                            })}
                                        </div>
                                    );
                                    popContentIndex++;
                                    return (
                                        <Popover content={popContent[popContentIndex - 1]}>
                                            <span>{item.name}</span>
                                        </Popover>
                                    )
                                })}
                            </div>
                            <div>
                                <span><CalendarOutlined />Post Date:</span>
                                <span>{this.state.particularPost_Post[0].added_datetime.split("T")[0]}</span>
                            </div>
                            <div>
                                <span><UserOutlined />Applicant:</span>
                                <span className="requestList-body-right-body-favoricon">{this.state.particularPost_Signer}</span>
                            </div>
                            <div>
                                <span>Description:</span>
                                <span> </span>
                            </div>
                            <div style={{ border: "1px solid #E5E5E5" }}>
                                <p>{this.state.particularPost_Post[0].description}</p>
                            </div>
                        </div>
                        <div className="requestList-body-right-footer"
                            style={{ display: this.state.displayButton }}>
                            <Button type="primary" onClick={this.showAddRewardsModal.bind(this)} style={{ display: this.state.displayAddRewardButton }}>Edit Rewards</Button>
                        </div>
                    </div>
                </div>
                <Modal
                    title="Select the rewards you want to add to this public request"
                    footer={[]}
                    visible={this.state.addRewardsVisible}
                    onCancel={this.handleCancel.bind(this)}>
                    <AddRewards
                        postID={this.state.particularPost_Post[0].post_id} />
                </Modal>
                <Modal
                    title="Select and upload the proof image"
                    footer={[]}
                    visible={this.state.uploadVisible}
                    onCancel={this.handleCancel.bind(this)}>
                    <CompletePost
                        postID={this.state.particularPost_Post[0].post_id} />
                </Modal>
            </div>
        );
    }

}

export default MyPosts;