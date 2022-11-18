import styles from './Container.module.css';

type ContainerProps = {
  children: React.ReactNode;
};

const Container = (props: ContainerProps) => {
    return (
        <div className={styles.component}>
            { props.children }
        </div>
    );
};

export default Container;
