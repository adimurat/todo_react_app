import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false); 
  const [editOpened, setEditOpened] = useState(false); 
  const [taskToEdit, setTaskToEdit] = useState(null); 
  const [sortState, setSortState] = useState(null);
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("Not done"); 
  const editTaskTitle = useRef(""); 
  const editTaskSummary = useRef(""); 
  const editTaskState = useRef("Not done"); 

  const states = [
    { value: "Done", label: "Done" },
    { value: "Not done", label: "Not done" },
    { value: "Doing right now", label: "Doing right now" },
  ];

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setOpened(false);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function editTask(index) {
    const task = tasks[index];
    setTaskToEdit(task);
    setEditOpened(true);
  }

  function updateTask() {
    const updatedTasks = tasks.map((task, index) =>
      index === tasks.indexOf(taskToEdit)
        ? {
            ...task,
            title: editTaskTitle.current.value,
            summary: editTaskSummary.current.value,
            state: editTaskState.current,
          }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditOpened(false);
    setTaskToEdit(null);
  }

  function loadTasks() {
    const loadedTasks = localStorage.getItem("tasks");
    if (loadedTasks) {
      setTasks(JSON.parse(loadedTasks));
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function sortTasksByState(state) {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.state === state && b.state !== state) return -1;
      if (a.state !== state && b.state === state) return 1;
      return 0;
    });
    setTasks(sortedTasks);
    setSortState(state); 
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={"New Task"}
            withCloseButton={false}
            onClose={() => setOpened(false)}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              mt={"md"}
              label={"State"}
              data={states}
              value={taskState.current}
              onChange={(value) => (taskState.current = value)}
            />
            <Group mt={"md"} position={"apart"}>
              <Button onClick={() => setOpened(false)} variant={"subtle"}>
                Cancel
              </Button>
              <Button onClick={createTask}>Create Task</Button>
            </Group>
          </Modal>

          <Modal
            opened={editOpened}
            size={"md"}
            title={"Edit Task"}
            withCloseButton={false}
            onClose={() => setEditOpened(false)}
            centered
          >
            <TextInput
              mt={"md"}
              ref={editTaskTitle}
              defaultValue={taskToEdit?.title}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={editTaskSummary}
              mt={"md"}
              defaultValue={taskToEdit?.summary}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              mt={"md"}
              label={"State"}
              data={states}
              value={editTaskState.current}
              onChange={(value) => (editTaskState.current = value)}
            />
            <Group mt={"md"} position={"apart"}>
              <Button onClick={() => setEditOpened(false)} variant={"subtle"}>
                Cancel
              </Button>
              <Button onClick={updateTask}>Save Changes</Button>
            </Group>
          </Modal>

          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>

            <Group position="apart" mt={"md"}>
              <Button onClick={() => sortTasksByState("Done")}>
                Show 'Done' first
              </Button>
              <Button onClick={() => sortTasksByState("Doing right now")}>
                Show 'Doing' first
              </Button>
              <Button onClick={() => sortTasksByState("Not done")}>
                Show 'Not done' first
              </Button>
            </Group>

            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => editTask(index)}
                        color={"blue"}
                        variant={"transparent"}
                      >
                        <Edit />
                      </ActionIcon>

                      <ActionIcon
                        onClick={() => deleteTask(index)}
                        color={"red"}
                        variant={"transparent"}
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary was provided for this task"}
                  </Text>
                  <Text mt={"md"} size={"sm"} color={"dimmed"}>
                    State: <strong>{task.state}</strong>
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button onClick={() => setOpened(true)} fullWidth mt={"md"}>
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}


