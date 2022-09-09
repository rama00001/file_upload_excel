import { Link } from "react-router-dom";
import "../app.css";
import React, { useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Dialog,
  IconButton
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import { ArrowDownward, CloudUploadRounded } from "@material-ui/icons";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import { useForm, Controller } from "react-hook-form";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
});

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});
const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1)
  }
}))(MuiDialogActions);

const useStyles = makeStyles({
  table: {
    "& .MuiTableCell-root": {
      minWidth: 120,
      borderRight: "1px solid #e6e6e6"
    },
    "& .MuiTableCell-head": {
      minWidth: 120,
      background: "#f0f8ff"
    }
  },
  btn: {
    margin: "10px"
  }
});

export default function SignInPage(props) {
  let history = useHistory();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [show, setShow] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose1 = () => {
    setOpen1(false);
  };
  const handleOpen1 = () => {
    setOpen1(true);
  };

  // process CSV data
  const processData = dataString => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
        console.log("csvlist", obj);
      }
    }

    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c
    }));

    setData(list);

    setColumns(columns);
  };

  // handle file upload
  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = evt => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  };

  const { register, handleSubmit, control, errors } = useForm();
  // console.log("sample_canditate_data" , data);

  const onSubmit = () => {
    console.log("props", props.type);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const clientId = userInfo.profile._id;
    const clientName = userInfo.profile.name;
    console.log("sample_canditate_data", data);
    let profilesList = [];
    if (data) {
      data.forEach(eachCandidate => {
        let eachProfile = {
          profile_type: props.type,
          clientRef: clientId,
          profile_mode: "regular",
          report_type: "Interim Report",
          priority: eachCandidate.priority,
          clientName: clientName,
          profile_intiated_date: { date: new Date().toISOString() },
          status: "Profile Initiated",
          email: eachCandidate.email,
          mobile: eachCandidate.mobile,
          password: "Albenus12@",
          personal_information: {
            firstName: eachCandidate.firstName,
            middleName: eachCandidate.middleName,
            lastName: eachCandidate.lastName,
            adharNumber: eachCandidate.adharNumber
          }
        };
        profilesList.push(eachProfile);
      });
    }
  };

  return (
    <div>
      <Paper>
        <Box display={"flex"} my={5} py={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleOpen}
            className={classes.btn}
            startIcon={<CloudUploadRounded />}
          >
            Upload File
          </Button>
        </Box>

        {show ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DataTable
              pagination
              highlightOnHover
              columns={columns}
              data={data}
            />
            <Box display={"flex"} justifyContent={"flex-end"} mt={3}>
              <Button
                onClick={handleClose}
                color="primary"
                className={classes.btn}
                variant="contained"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.btn}
              >
                Submit
              </Button>
            </Box>
          </form>
        ) : null}
      </Paper>
      <Dialog
        open={open}
        maxWidth="xs"
        fullWidth
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" onClose={handleClose}>
          Upload File
        </DialogTitle>
        <form>
          <TextField
            placeholder="Upload File"
            label="Upload File "
            variant="outlined"
            fullWidth
            margin="dense"
            InputLabelProps={{
              shrink: true
            }}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />

          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              className={classes.btn}
              onClick={() => {
                setShow(true);
                setOpen(false);
              }}
            >
              Submit
            </Button>
            <Button
              onClick={handleClose}
              color="secondary"
              variant="contained"
              className={classes.btn}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* offline */}
      <Dialog
        open={open1}
        maxWidth="xs"
        fullWidth
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" onClose={handleClose1}>
          Upload File
        </DialogTitle>
        <form>
          <DialogContent dividers>
            <TextField
              placeholder="Upload File "
              label="Upload File "
              variant="outlined"
              fullWidth
              margin="dense"
              InputLabelProps={{
                shrink: true
              }}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
          </DialogContent>
          <DialogContent>
            <TextField
              placeholder="Upload Zip File 300Mb"
              label="Upload Zip File 300MB"
              variant="outlined"
              fullWidth
              margin="dense"
              InputLabelProps={{
                shrink: true
              }}
              type="file"
              accept=".zip"
              // onChange={handleFileUpload}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                setShow(true);
                setOpen1(false);
              }}
              variant="contained"
              className={classes.btn}
            >
              Submit
            </Button>
            <Button
              onClick={handleClose1}
              color="secondary"
              type="submit"
              variant="contained"
              className={classes.btn}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
