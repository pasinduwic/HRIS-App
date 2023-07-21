import {
  Page,
  Image,
  Text,
  Document,
  StyleSheet,
  View,
  Font
} from "@react-pdf/renderer";
import logo from "../images/logo.png";

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf"
});

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35
  },
  view: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  viewHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgb(22, 30, 84)",
    color: "white",
    padding: "12 10"
  },
  net: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    border: "1px solid black",
    borderLeft: "none",
    borderRight: "none",
    marginTop: 10
  },
  viewHigher: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 40
  },
  title: {
    fontSize: 24,
    textAlign: "left",
    fontFamily: "Oswald"
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
    marginBottom: 0,
    fontFamily: "Oswald"
  },
  title2: {
    fontSize: 18,
    // margin: 12,
    marginBottom: 20,
    marginTop: 28,
    fontFamily: "Oswald",
    border: "1px solid black",
    borderLeft: "none",
    borderRight: "none"
  },
  subtitle2: {
    fontSize: 16,
    margin: 8,
    marginBottom: 14,
    fontFamily: "Oswald"
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 100,
    marginLeft: 14,
    fontFamily: "Times-Roman"
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman"
  },
  image: {
    width: 80,
    height: 60,
    marginRight: 20,
    borderRadius: "50%"
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey"
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey"
  }
});

const PaysheetPDF = ({ data, fName, lName, EPF }) => {
  const months = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "Septrmber",
    10: "October",
    11: "November",
    12: "Decenber"
  };

  const payMonth = months[data.month];

  return (
    <Document>
      <Page style={styles.body}>
        <View style={styles.viewHeader}>
          <Image style={styles.image} src={logo} />
          <Text style={styles.title}>Company Name</Text>
        </View>

        <Text style={styles.title2}>
          Salary Slip for the month of {payMonth}
        </Text>

        <View style={styles.view}>
          <Text style={styles.fieldName}>Employee Name :</Text>
          <Text style={styles.text}>
            {fName} {lName}
          </Text>
        </View>
        <View style={styles.view}>
          <Text style={styles.fieldName}>Employee Id :</Text>
          <Text style={styles.text}>{EPF}</Text>
        </View>

        <Text style={styles.subtitle}>Salary</Text>
        <View style={styles.view}>
          <Text style={styles.fieldName}>Basic Salary :</Text>
          <Text style={styles.text}>{data.basic}</Text>
        </View>

        <Text style={styles.subtitle}>Allawances</Text>
        <View style={styles.view}>
          <Text style={styles.fieldName}>Transport Allowance :</Text>
          <Text style={styles.text}>{data.transportAllawance}</Text>
        </View>
        <View style={styles.view}>
          <Text style={styles.fieldName}>Mobile Allowance :</Text>
          <Text style={styles.text}>{data.mobileAllawance}</Text>
        </View>
        <View style={styles.view}>
          <Text style={styles.fieldName}>Other Allowances :</Text>
          <Text style={styles.text}>{data.otherAllawance}</Text>
        </View>

        <Text style={styles.subtitle}>Over Time (OT)</Text>
        <View style={styles.view}>
          <View style={styles.view}>
            <Text style={styles.fieldName}>Time (hr) :</Text>
            <Text style={styles.text}>{data.OTCount}</Text>
          </View>
          <View style={styles.view}>
            <Text style={styles.fieldName}>Amount :</Text>
            <Text style={styles.text}>{data.OTAmount}</Text>
          </View>
        </View>

        <View style={styles.viewHigher}>
          <View>
            <Text style={styles.subtitle}>Deductions</Text>
            <View style={styles.view}>
              <Text style={styles.fieldName}>PAYE :</Text>
              <Text style={styles.text}>{data.tax}</Text>
            </View>
            <View style={styles.view}>
              <Text style={styles.fieldName}>EPF 8% :</Text>
              <Text style={styles.text}>{data.EPFEmp}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.subtitle}>Employer Contribution</Text>
            <View style={styles.view}>
              <Text style={styles.fieldName}>EPF 12% :</Text>
              <Text style={styles.text}>{data.EPFCompany}</Text>
            </View>
            <View style={styles.view}>
              <Text style={styles.fieldName}>ETF 3% :</Text>
              <Text style={styles.text}>{data.ETF}</Text>
            </View>
          </View>
        </View>
        <View style={styles.net}>
          <Text style={styles.subtitle2}>Net Salary :</Text>
          <Text style={styles.text}>{data.net}</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default PaysheetPDF;
