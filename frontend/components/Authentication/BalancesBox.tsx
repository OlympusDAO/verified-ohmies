import { Paper, DataRow } from "@olympusdao/component-library";

const BalancesBox = ({ gOHMBalance }) => {

  return (
    <Paper> {/*style={{ height: "11vh" }}>*/}
      <DataRow
        balance={`${parseFloat(gOHMBalance).toFixed(4)} gOHM`}
        title="Your Balance"
      />
    </Paper>
  );
};

export default BalancesBox;