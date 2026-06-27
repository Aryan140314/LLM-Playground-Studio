import plotly.express as px


def bar_chart(data_frame, x: str, y: str, title: str = ""):
    return px.bar(data_frame, x=x, y=y, title=title)
