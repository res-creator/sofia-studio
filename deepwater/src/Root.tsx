import React from 'react';
import { Composition, Still } from 'remotion';
import { Well } from './well';
const WellTest: React.FC = () => <Well t={5} show={['rig', 'riser', 'bop', 'well', 'pipe', 'kill', 'gauges', 'mud', 'cement', 'depth', 'labels']} />;
export const Root: React.FC = () => (<>
  <Still id="WellTest" component={WellTest} width={1920} height={1080} />
</>);
