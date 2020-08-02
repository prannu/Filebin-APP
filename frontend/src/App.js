import axios from 'axios';

import React, { Component } from 'react';
import { Grid, Typography, Input, Button,Link, Snackbar } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert';

class App extends Component {

  state = {
    selectedFile: null,
    downloadUrl: '',
    message: '',
    severity: '',
    openSnackBar: false
  };

  onFileChange = event => {
    if (event.target.files[0] && event.target.files[0].size > 20 * 1000 * 1000) {
      this.setState({
        openSnackBar: true,
        message: "File size should be less than 20MB",
        severity: "error",
      })
    } else {
      this.setState({ 
        selectedFile: event.target.files[0] ,
        downloadUrl:''
      });
    }


  };

  onFileUpload = () => {

    const formData = new FormData();

    formData.append(
      "myFile",
      this.state.selectedFile,
    );

    axios.post("http://localhost:8080/uploadfile", formData, {

    }).then(res => {
      if (res.status == 200) {
        this.setState({
          downloadUrl: res.data.downloadURL,
          message:"Uploaded the file succesfully",
          severity:"success",
          openSnackBar:true
        })
      }
    })
  };

  fileData = () => {

    if (this.state.selectedFile && this.state.downloadUrl) {

      return (
        <Grid style={{paddingTop:'30px'}}>
          <Typography color="primary">Download URL: {this.state.downloadUrl}</Typography> 
        </Grid>
      );
    }
  };
  handleClose = () => {
    this.setState({
      openSnackBar: false
    })
  }

  render() {

    return (
      <Grid container
        direction="column"
        alignItems="center"
        justify="center"
        style={{backgroundColor: "cadetblue",padding:"10%"}}>
        <Grid item >
          <h1 style={{fontFamily: 'serif'}}>
            FILEBIN
          </h1>
        </Grid>
        <Grid item >
          <Typography>
            Simply upload a file and get the sharable link to download. It's a one time downloadable link.After that file will not be available to download with that link.
          </Typography>
        </Grid>
        <Grid item style={{paddingTop:'30px'}}>
          <Input variant="contained" color="primary" type="file" onChange={this.onFileChange} />
        </Grid>
        <Grid style={{paddingTop:'30px'}}>
          <Button onClick={this.onFileUpload} disabled={!this.state.selectedFile} color="primary" variant="contained">
            Upload!
            </Button>
        </Grid>
        <Grid>
          {this.fileData()}
        </Grid>
        <Snackbar open={this.state.openSnackBar} autoHideDuration={6000} onClose={this.handleClose}>
          <Alert onClose={this.handleClose} severity={this.state.severity}>
            {this.state.message}
          </Alert>
        </Snackbar>
      </Grid>
    );
  }
}

export default App; 