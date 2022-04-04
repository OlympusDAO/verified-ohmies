import { Paper, DataRow } from "@olympusdao/component-library";

const BalancesBox = ({ score }) => {

  return (
    <Paper> {/*style={{ height: "11vh" }}>*/}
      <DataRow
        balance={`${parseInt(score)}`}
        title="Your Score"
      />
    </Paper>
  );
};

export default BalancesBox;