function Header() {
    function gerarDataFormatada() {
        const data = new Date();
        const dia = data.getDate();
        const ano = data.getFullYear();

        const meses = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];

        const mes = meses[data.getMonth()];

        return `Póvoa de Varzim, ${dia} de ${mes} de ${ano}.`;
    }

    return (
    <>
        <div className="header">
            <div className="header-img">
                <img className="school-logo" src="./public/school-logo.png" alt="" />
            </div>
            <div className="data-time">
                {gerarDataFormatada()}
            </div>
        </div>
    </>
  );
}

export default Header;
