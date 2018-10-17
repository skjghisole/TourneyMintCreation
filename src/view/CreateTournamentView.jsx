import React from 'react';
import { observer, inject } from 'mobx-react';
import { Redirect, withRouter } from 'react-router-dom';
import { Delete, Add } from '@material-ui/icons';
import { withStyles, Button, TextField, Grid, Paper } from '@material-ui/core';

const styles = {
    elementContainer: {
        paddingBottom: 15
    },
    formContainer: {
    	paddingTop: 15
    }
}

const CreateTournamentView = ({ classes, formStore, gameStore }) => {
	const {
		registerDynamicInput,
		registerInput
	} = formStore;
	const {
		createGame,
		redirect
	} = gameStore;
	const module = "create";
	const mainField = "createTourna";
	const dynamicOptions = {
	    type: 'multi',
	    initialCount: 1,
	};
	const subFields = ['teamName']
  registerInput(module, 'teamName');
	registerDynamicInput(
		module,
		mainField,
		subFields,
		dynamicOptions
  )
	const dynamicForm = formStore[`${module}-dynamic`][mainField];
	return (
		<Grid container alignContent={"center"} alignItems={"center"} justify={"center"}>
			<Grid item xs={12} md={6} className={classes.formContainer}>
				<Paper square elevation={4}>
					<Grid container alignContent={"center"} alignItems={"center"} justify={"center"} direction={"column"} className={classes.formContainer}> 
						<Grid item xs={12} md={6}>
						  <TextField
			          label="Tournament Name"
			          fullWidth
			          name={`${mainField}-tournamentName`}
			          onChange={formStore.handleInputChange(module)}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
					    {
								dynamicForm.elements.map((e, i, arr) => (
								  <div key={i} className={classes.elementContainer}>
								      <TextField
								          label="Team Name"
								          fullWidth
								          name={`${mainField}-${i}-teamName`}
								          onChange={formStore.handleInputChange(module)}
								      />
								      <Button fullWidth onClick={formStore.removeDIElement(module, mainField, i, arr.length)} color="secondary">
								          <Delete /> Delete Team
								      </Button>
								  </div>
								))
								}
								<Button fullWidth onClick={formStore.addDIElement(module, mainField)}>
									<Add /> Add Team
								</Button>
						</Grid>
					</Grid>
				</Paper>
				<br/>
				<Grid item sm={12} md={12}>
					<Button fullWidth onClick={() => createGame(module, mainField)}>Set Players</Button>
				</Grid>
				{
					redirect && <Redirect to={`/tournament/${redirect}`} />
				}
			</Grid>
		</Grid>
	)
}

export default withRouter(withStyles(styles)(inject('formStore', 'gameStore')(observer(CreateTournamentView))));