import React, { useState, useMemo } from 'react';
import { ScrollView, Text, VStack, HStack, Input, IconButton, ArrowUpIcon, Center } from 'native-base';
import * as R from 'ramda';
import uuid from 'react-native-uuid';

import { Task, TaskData } from './Task';
import { FilterIcon } from '../icons';

export const TasksList = () => {
	const [todoText, setTodoText] = useState<string>();
	const [isFilterEnabled, setIsFilterEnabled] = useState(false);
	const [tasks, setTasks] = useState<TaskData[]>([]);
	const filteredTasks = useMemo(
		() => (isFilterEnabled ? R.filter<TaskData>(R.propEq('completed', false))(tasks) : [...tasks]),
		[tasks, isFilterEnabled],
	);

	const handleTaskPress = (taskId: string | number) => () => {
		const toggleCompleteProp = R.over<TaskData, boolean>(R.lensProp('completed'), R.not);
		const matchTaskId = R.propEq('id', taskId);
		const updateTasks = R.map(R.when(matchTaskId, toggleCompleteProp));
		setTasks(updateTasks);
	};

	const handleSubmitTodo = () => {
		if (!todoText) {
			return;
		}
		const checkIfTextExists = R.find(R.propEq('text', todoText));
		if (checkIfTextExists(tasks)) {
			return;
		}
		const newTodo: TaskData = { id: uuid.v4() as string | number, text: todoText, completed: false };
		const prependTodo = R.prepend<TaskData>(newTodo);
		setTasks(prependTodo);
		setTodoText('');
	};

	const handleToggleFilter = () => {
		// const filterOutCompleted = R.filter(R.propEq('completed', isFilterEnabled));
		// setTasks(filterOutCompleted);
		setIsFilterEnabled(!isFilterEnabled);
	};

	const handleTaskDelete = (taskId: string | number) => () => {
		const getTask = R.propEq('id', taskId);
		const rejectTask = R.reject<TaskData>(getTask);
		setTasks(rejectTask);
	};

	return (
		<VStack pt={7} flex={1}>
			<HStack justifyContent="space-between" px={7} alignItems="center">
				<Text color="muted.600" fontWeight="400" fontSize="4xl">
					My Tasks
				</Text>
				<IconButton
					_icon={{ as: FilterIcon, color: isFilterEnabled ? 'primary.500' : 'muted.500' }}
					onPress={handleToggleFilter}
				/>
			</HStack>
			<ScrollView
				_contentContainerStyle={{
					mb: '4',
					px: 7,
				}}
			>
				<VStack space="5" py="8">
					{filteredTasks.map((task) => (
						<Task key={task.id} data={task} onPress={handleTaskPress(task.id)} onDelete={handleTaskDelete(task.id)} />
					))}
				</VStack>
				{tasks?.length === 0 ? (
					<Center>
						<Text color="muted.300" fontSize="25" textAlign="center">
							No tasks yet! Add one below
						</Text>
					</Center>
				) : filteredTasks?.length === 0 ? (
					<Center>
						<Text color="muted.300" fontSize="25" textAlign="center">
							Hooray! No pending tasks. {'\n'}Remove the filter to see tasks.
						</Text>
					</Center>
				) : null}
			</ScrollView>
			<HStack space="5" py="5" px={7}>
				<Input
					placeholder="Enter a new task"
					w="75%"
					maxWidth="300px"
					mx="0"
					flex="1"
					variant="rounded"
					pl="5"
					value={todoText}
					onChangeText={setTodoText}
					autoFocus
				/>
				<IconButton
					size="lg"
					variant="solid"
					icon={<ArrowUpIcon size="6" />}
					borderRadius="30"
					onPress={handleSubmitTodo}
				/>
			</HStack>
		</VStack>
	);
};